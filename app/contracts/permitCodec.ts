import {
  packDataBytes,
  type MichelsonType,
  type MichelsonData,
} from "@mavrykdynamics/taquito-michel-codec";
import { Schema } from "@mavrykdynamics/taquito-michelson-encoder";
import {
  buf2hex,
  hex2buf,
  getPkhfromPk,
  verifySignature,
} from "@mavrykdynamics/taquito-utils";
import { hash } from "@stablelib/blake2b";
import { toNatString } from "~/lib/utils/formaters";

export type Micheline = MichelsonData | MichelsonType;
export const hashBytes = (bytes: string) => buf2hex(hash(hex2buf(bytes), 32));
// Pin executable generation, not an address allowlist. Runtime catalog admission is separate.
export const fingerprint = (value: unknown) =>
  buf2hex(hash(new TextEncoder().encode(JSON.stringify(value)), 32));

export function findAnnotation(
  node: unknown,
  annotation: string
): MichelsonType {
  const matches: MichelsonType[] = [];
  const visit = (value: unknown) => {
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (!value || typeof value !== "object") return;
    const current = value as { annots?: string[]; args?: unknown[] };
    if (current.annots?.includes(annotation))
      matches.push(value as MichelsonType);
    current.args?.forEach(visit);
  };
  visit(node);
  if (matches.length !== 1)
    throw new Error(`Unsupported contract schema: ${annotation}`);
  return matches[0];
}

// Confirmed in captured token CHECK_SIGNATURE lambdas and the orderbook's
// lambdaPermitAndExecute: ((CHAIN_ID, SELF_ADDRESS), (counter, (actionHash, deadline))).
export const permitDomainType: MichelsonType = {
  prim: "pair",
  args: [
    { prim: "pair", args: [{ prim: "chain_id" }, { prim: "address" }] },
    {
      prim: "pair",
      args: [
        { prim: "nat" },
        { prim: "pair", args: [{ prim: "bytes" }, { prim: "timestamp" }] },
      ],
    },
  ],
};

export function encodePermit(input: {
  actionType: MichelsonType;
  action: object;
  chainId: string;
  contract: string;
  counter: string;
  deadline: string;
}) {
  const actionValue = new Schema(input.actionType).Encode(
    input.action
  ) as MichelsonData;
  const actionBytes = packDataBytes(actionValue, input.actionType).bytes;
  const actionHash = hashBytes(actionBytes);
  const payloadValue = new Schema(permitDomainType).Encode([
    input.chainId,
    input.contract,
    toNatString(input.counter),
    actionHash,
    new Date(Number(input.deadline) * 1000).toISOString(),
  ]) as MichelsonData;
  const payload = packDataBytes(payloadValue, permitDomainType).bytes;
  if (!actionBytes.startsWith("05") || !payload.startsWith("05"))
    throw new Error("Invalid permit packing prefix");
  return { actionValue, actionBytes, actionHash, payload };
}

export function assertPermitSigner(publicKey: string, wallet: string) {
  if (!/^(edpk|sppk|p2pk)/.test(publicKey))
    throw new Error("This wallet key curve is not supported for permits");
  if (getPkhfromPk(publicKey) !== wallet)
    throw new Error("The public key does not match the connected wallet");
}

export function verifyPermitSignature(
  payload: string,
  publicKey: string,
  signature: string,
  wallet: string
) {
  assertPermitSigner(publicKey, wallet);
  // Taquito hashes the raw packed bytes once with blake2b-256. Do not pass a digest or auth string.
  if (
    !/^05(?:[0-9a-f]{2})+$/i.test(payload) ||
    !verifySignature(payload, publicKey, signature)
  ) {
    throw new Error("The wallet returned an invalid permit signature");
  }
}
