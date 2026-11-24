import { describe, expect, it } from "vitest";
import type { MichelsonType } from "@mavrykdynamics/taquito-michel-codec";
import golden from "../../docs/fixtures/permit-deployment/golden-vectors.json";
import { encodePermit, verifyPermitSignature } from "./permitCodec";

// Golden vectors from the contracts repo (MavrykDynamics/rwa-marketplace,
// src/contracts/test/vectors/generatePermitVectors.ts), copied unchanged: every
// permit variant of an orderbook, a base token, the quote token and the KYC
// contract on basenet. Their bytes are the node's pack_data, and the deployed
// contracts accepted their signatures in run_code (README.md, "Golden
// vectors"). The gas station checks its own encoder against the same file.
const contracts = golden.contracts as unknown as Record<
  string,
  { actionType: MichelsonType }
>;

describe("permit golden vectors", () => {
  it.each(golden.vectors)("$name packs as the deployed contract signs", (v) => {
    const encoded = encodePermit({
      actionType: contracts[v.kind].actionType,
      action: v.action,
      chainId: v.chainId,
      contract: v.contract,
      counter: v.counter,
      deadline: v.deadlineSeconds,
    });
    expect(encoded.actionBytes).toBe(v.actionBytes);
    expect(encoded.actionHash).toBe(v.actionHash);
    expect(encoded.payload).toBe(v.payload);
    expect(() =>
      verifyPermitSignature(encoded.payload, v.publicKey, v.signature, v.wallet)
    ).not.toThrow();
  });
});
