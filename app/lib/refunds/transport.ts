import { Schema } from "@mavrykdynamics/taquito-michelson-encoder";
import {
  packDataBytes,
  type MichelsonData,
  type MichelsonType,
} from "@mavrykdynamics/taquito-michel-codec";
import { getPkhfromPk, verifySignature } from "@mavrykdynamics/taquito-utils";
import type { SigningType } from "@mavrykdynamics/beacon-dapp";
import { blake2b } from "@noble/hashes/blake2b";
import { z } from "zod";
import { rwaApi } from "~/lib/apis/rwa/client";
import { fetchGetOperationsByHash, isKnownChainId } from "~/lib/apis/tzkt";
import type { dappClient } from "~/providers/WalletProvider/WalletCore.client";
import {
  readRefundPage,
  readRelayConfig,
  relayOperationSchema,
  serviceFee,
} from "./api";
import type { Chunk, RefundRun } from "./model";
import { RefundFailure, type RefundPorts } from "./runner";
import { MavrykChainId } from "~/lib/mavryk/types";

type Dapp = ReturnType<typeof dappClient>;
type Expr = { prim?: string; args?: Expr[]; annots?: string[] };
function find(node: Expr, name: string): Expr | undefined {
  if (node.annots?.includes(`%${name}`)) return node;
  for (const arg of node.args ?? []) {
    const value = find(arg, name);
    if (value) return value;
  }
}
function pairFields(node: Expr): Expr[] {
  return node.prim === "pair" ? (node.args ?? []).flatMap(pairFields) : [node];
}
const hex = (value: Uint8Array) =>
  [...value].map((x) => x.toString(16).padStart(2, "0")).join("");
const bytes = (value: string) =>
  Uint8Array.from(value.match(/../g) ?? [], (x) => parseInt(x, 16));

export async function assertScope(dapp: Dapp, wallet: string, chain: string) {
  const account = await dapp.getDAppClient().getActiveAccount();
  const rpc = dapp.tezos().rpc;
  const walletChains: Record<string, string> = {
    mainnet: MavrykChainId.Mainnet,
    basenet: MavrykChainId.Basenet,
    weeklynet: MavrykChainId.Weekly,
    atlasnet: MavrykChainId.Atlas,
  };
  const network = account?.network;
  // Beacon sends direct transactions on the active account's network, which can
  // differ from the application's read RPC even when the address is unchanged.
  const customMatches =
    network?.type === "custom" &&
    network.rpcUrl?.replace(/\/$/, "") === rpc.getRpcUrl().replace(/\/$/, "");
  if (
    account?.address !== wallet ||
    (!customMatches && walletChains[network?.type ?? ""] !== chain) ||
    (await rpc.getChainId()) !== chain
  )
    throw new RefundFailure(
      "SCOPE_CHANGED",
      "The wallet or network changed. Reconnect the original account to continue."
    );
  if (!account.publicKey || getPkhfromPk(account.publicKey) !== wallet)
    throw new Error("Wallet public key is unavailable");
  return { ...account, publicKey: account.publicKey };
}

async function estimator(dapp: Dapp, wallet: string, chain: string) {
  const account = await assertScope(dapp, wallet, chain),
    toolkit = dapp.tezos();
  // Estimation needs a public identity, never a private signing capability.
  toolkit.setSignerProvider({
    publicKeyHash: async () => account.address,
    publicKey: async () => account.publicKey,
    secretKey: async () => {
      throw new Error("Read-only estimator");
    },
    sign: async () => {
      throw new Error("Read-only estimator");
    },
  });
  return toolkit;
}

function resourceError(error: unknown): boolean {
  const pending: unknown[] = [error];
  for (let i = 0; pending.length && i < 128; i++) {
    const node = pending.pop();
    if (!node || typeof node !== "object") continue;
    if (Array.isArray(node)) {
      pending.push(...node.slice(0, 128));
      continue;
    }
    const r = node as Record<string, unknown>;
    if ("with" in r) continue;
    if (
      typeof r.id === "string" &&
      (/^proto\.[\w-]+\.gas_exhausted\.operation$/.test(r.id) ||
        /^(?:proto\.[\w-]+\.)?oversized_operation$/.test(r.id))
    )
      return true;
    // SDK contract failwith messages may contain arbitrary JSON text. Only
    // structured RPC envelopes can establish a pre-injection resource failure.
    for (const key of ["errors", "data", "body"]) {
      const value = r[key];
      if (value && typeof value === "object") pending.push(value);
      else if (typeof value === "string" && value.length < 131072) {
        const at = value.search(/[\[{]/);
        if (at >= 0)
          try {
            pending.push(JSON.parse(value.slice(at)));
          } catch {
            /* unknown */
          }
      }
    }
  }
  return false;
}

export async function estimateChunks(
  dapp: Dapp,
  run: RefundRun
): Promise<Chunk[]> {
  if (run.mode === "credits") return run.chunks; // Actual signed permits are simulated by Gas Station.
  const toolkit = await estimator(dapp, run.wallet, run.chain);
  const ready: Chunk[] = [],
    pending = [...run.chunks];
  while (pending.length) {
    const chunk = pending.shift()!;
    const contract = await toolkit.contract.at(chunk.book);
    const params = contract.methodsObject
      .processRefund(chunk.orders)
      .toTransferParams();
    try {
      if (
        new TextEncoder().encode(JSON.stringify(params.parameter)).length >
        16_000
      )
        throw new RefundFailure(
          "OPERATION_RESOURCE_LIMIT",
          "Refund operation is too large"
        );
      await toolkit.estimate.transfer({ ...params, source: run.wallet });
      ready.push(chunk);
    } catch (error) {
      if (
        !(
          error instanceof RefundFailure &&
          error.code === "OPERATION_RESOURCE_LIMIT"
        ) &&
        !resourceError(error)
      )
        throw error;
      if (chunk.orders.length === 1)
        throw new Error(
          "One refund exceeds the operation limit. Contact support for this order."
        );
      const half = Math.ceil(chunk.orders.length / 2);
      pending.unshift(
        { ...chunk, orders: chunk.orders.slice(0, half) },
        { ...chunk, orders: chunk.orders.slice(half) }
      );
    }
  }
  return ready;
}

export function packedPermit(
  chain: string,
  book: string,
  counter: string,
  actionHash: string,
  deadline?: string
) {
  const tail: MichelsonType = deadline
    ? { prim: "pair", args: [{ prim: "bytes" }, { prim: "timestamp" }] }
    : { prim: "bytes" };
  const type: MichelsonType = {
    prim: "pair",
    args: [
      { prim: "pair", args: [{ prim: "chain_id" }, { prim: "address" }] },
      { prim: "pair", args: [{ prim: "nat" }, tail] },
    ],
  };
  const values = [
    chain,
    book,
    counter,
    actionHash,
    ...(deadline ? [deadline] : []),
  ];
  return packDataBytes(new Schema(type).Encode(values), type).bytes;
}

const transferType: MichelsonType = {
  prim: "list",
  args: [
    {
      prim: "pair",
      args: [
        { prim: "address", annots: ["%from_"] },
        {
          prim: "list",
          annots: ["%txs"],
          args: [
            {
              prim: "pair",
              args: [
                { prim: "address", annots: ["%to_"] },
                {
                  prim: "pair",
                  args: [
                    { prim: "nat", annots: ["%token_id"] },
                    { prim: "nat", annots: ["%amount"] },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};
const transferSchema = new Schema(transferType);

function payoutsFromReceipt(
  internals: unknown[],
  book: string,
  wallet: string
) {
  const totals = new Map<
    string,
    { token: string; id: string; units: string }
  >();
  if (internals.length > 10_000)
    throw new Error("Refund receipt exceeds the supported size");
  for (const value of internals) {
    const internal = z
      .object({
        kind: z.string(),
        source: z.string(),
        destination: z.string().optional(),
        parameters: z
          .object({ entrypoint: z.string(), value: z.unknown() })
          .optional(),
        result: z.object({ status: z.string() }),
      })
      .parse(value);
    if (
      internal.kind !== "transaction" ||
      internal.source !== book ||
      internal.parameters?.entrypoint !== "transfer"
    )
      continue;
    if (!internal.destination || internal.result.status !== "applied")
      throw new Error("Refund token transfer is not applied");
    const transfers = transferSchema.Execute(
      internal.parameters.value as MichelsonData
    ) as {
      from_: string;
      txs: {
        to_: string;
        token_id: { toFixed(): string };
        amount: { toFixed(): string };
      }[];
    }[];
    for (const transfer of transfers) {
      if (transfer.from_ !== book) continue;
      for (const tx of transfer.txs) {
        if (tx.to_ !== wallet) continue;
        const id = tx.token_id.toFixed(),
          amount = tx.amount.toFixed();
        if (!/^(0|[1-9][0-9]*)$/.test(id) || !/^(0|[1-9][0-9]*)$/.test(amount))
          throw new Error("Invalid refund transfer amount");
        if (BigInt(amount) === 0n) continue;
        const key = `${internal.destination}:${id}`,
          old = totals.get(key);
        totals.set(key, {
          token: internal.destination,
          id,
          units: (BigInt(old?.units ?? "0") + BigInt(amount)).toString(),
        });
      }
    }
  }
  return [...totals.values()];
}

export function createPorts(
  dapp: Dapp,
  run: RefundRun,
  persist: RefundPorts["persist"],
  alive: () => boolean
): RefundPorts {
  const scope = async () => {
    if (!alive())
      throw new Error("Progress saved. Reopen this asset to continue.");
    await assertScope(dapp, run.wallet, run.chain);
  };
  const receiptPayouts = new Map<
    string,
    ReturnType<typeof payoutsFromReceipt>
  >();
  return {
    persist,
    assertScope: scope,
    pause: () => new Promise((resolve) => setTimeout(resolve, 3000)),
    async sign(chunk) {
      await scope();
      const intent = {
        kind: "process_refund",
        orderbookAddress: chunk.book,
        orders: chunk.orders,
      };
      if (new TextEncoder().encode(JSON.stringify(intent)).length > 32 * 1024)
        throw new RefundFailure(
          "PAYLOAD_TOO_LARGE",
          "The refund intent is too large. Refresh using smaller parts."
        );
      const config = await readRelayConfig();
      if (
        !config.enabled ||
        !config.contracts.some(
          (c) =>
            c.address === chunk.book &&
            c.permitActions.includes("permitProcessRefund")
        )
      )
        throw new RefundFailure(
          "RELAY_UNAVAILABLE",
          "Credits are unavailable for this orderbook. Choose MVRK explicitly after refreshing."
        );
      if (
        serviceFee(config) !== run.feePerChunk ||
        (config.fee.tokenContract ?? "") !== run.feeToken ||
        (config.fee.decimals ?? 0) !== run.feeDecimals
      )
        throw new RefundFailure(
          "FEE_CHANGED",
          "The fee changed. Refresh the preview before signing."
        );
      if (BigInt(run.feePerChunk) > 0n) {
        const credits = z
          .object({
            balanceUnits: z.string(),
            freeAllowanceRemaining: z.number().int().nonnegative(),
          })
          .parse(
            (await rwaApi.get(`/wallets/${run.wallet}/relay/fee/credits`)).data
          );
        if (
          credits.freeAllowanceRemaining === 0 &&
          BigInt(credits.balanceUnits) < BigInt(run.feePerChunk)
        )
          throw new RefundFailure(
            "FEE_CREDIT_REQUIRED",
            "Insufficient Credits for this part. Top up or choose MVRK after refreshing."
          );
      }
      const toolkit = dapp.tezos(),
        account = await assertScope(dapp, run.wallet, run.chain);
      const contract = await toolkit.contract.at(chunk.book);
      const entry = (await toolkit.rpc.getEntrypoints(chunk.book)).entrypoints
        .permitAndExecute as Expr | undefined;
      if (!entry || entry.prim !== "list" || !entry.args?.[0])
        throw new RefundFailure(
          "UNSUPPORTED_SCHEMA",
          "This book does not support refunds with Credits."
        );
      const fields = pairFields(entry.args[0]),
        actionType = find(entry, "action");
      if (
        !actionType ||
        ![3, 4].includes(fields.length) ||
        !find(actionType, "permitProcessRefund")
      )
        throw new RefundFailure(
          "UNSUPPORTED_SCHEMA",
          "Unsupported refund permit schema"
        );
      const hasDeadline = fields.some((f) => f.annots?.includes("%deadline"));
      if (fields.length !== (hasDeadline ? 4 : 3))
        throw new RefundFailure(
          "UNSUPPORTED_SCHEMA",
          "Unsupported permit fields"
        );
      const storage = await contract.storage<{
        permitsCounterLedger: {
          get(k: string): Promise<{ toFixed(): string } | undefined>;
        };
        userPermitsExpiryLedger?: {
          get(k: string): Promise<{ toFixed(): string } | undefined>;
        };
        config: { permitDefaultExpiryDuration: { toFixed(): string } };
      }>();
      const counter =
        (await storage.permitsCounterLedger.get(run.wallet))?.toFixed() ?? "0";
      if (!/^(0|[1-9][0-9]*)$/.test(counter))
        throw new Error("Invalid permit counter");
      if (BigInt(counter) > 9223372036854775807n)
        throw new RefundFailure(
          "UNSUPPORTED_COUNTER",
          "This permit counter exceeds the relay's supported range. Nothing was signed."
        );
      let deadline: string | undefined;
      if (hasDeadline) {
        const expiry = Number(
          (await storage.userPermitsExpiryLedger?.get(run.wallet))?.toFixed() ??
            storage.config.permitDefaultExpiryDuration.toFixed()
        );
        if (!Number.isSafeInteger(expiry) || expiry <= 0)
          throw new Error("Permit expiry is unavailable");
        const header = await toolkit.rpc.getBlockHeader();
        deadline = new Date(
          Date.parse(header.timestamp) + Math.min(expiry, 180) * 1000
        ).toISOString();
      }
      const action = { permitProcessRefund: chunk.orders };
      const encoded = new Schema(actionType as MichelsonType).Encode(
        action
      ) as MichelsonData;
      const hash = hex(
        blake2b(
          bytes(packDataBytes(encoded, actionType as MichelsonType).bytes),
          { dkLen: 32 }
        )
      );
      const packed = packedPermit(
        run.chain,
        chunk.book,
        counter,
        hash,
        deadline
      );
      await scope();
      const signature = await dapp.getDAppClient().requestSignPayload({
        payload: packed,
        sourceAddress: run.wallet,
        signingType: "micheline" as SigningType,
      });
      await scope();
      if (!verifySignature(packed, account.publicKey, signature.signature))
        throw new RefundFailure(
          "BAD_SIGNATURE",
          "The wallet signed different bytes. Nothing was submitted."
        );
      const permit = {
        userPublicKey: account.publicKey,
        userSignature: signature.signature,
        action,
        ...(deadline ? { deadline } : {}),
      };
      const params = contract.methodsObject
        .permitAndExecute([permit])
        .toTransferParams();
      const request = {
        intent,
        operation: { to: chunk.book, amount: "0", parameter: params.parameter },
        permitCounter: counter,
        idempotencyKey: crypto.randomUUID(),
      };
      // Keep headroom for the backend and Gas Station transport envelopes.
      if (new TextEncoder().encode(JSON.stringify(request)).length > 60 * 1024)
        throw new RefundFailure(
          "PAYLOAD_TOO_LARGE",
          "The signed refund is too large. Nothing was submitted; refresh using smaller parts."
        );
      chunk.signature = signature.signature;
      return request;
    },
    async submit(request) {
      try {
        return relayOperationSchema.parse(
          (
            await rwaApi.post(
              `/wallets/${run.wallet}/relay/operations`,
              request,
              { timeout: 20_000 }
            )
          ).data
        );
      } catch (error) {
        const e = error as {
          response?: {
            status: number;
            data?: {
              code?: string;
              error?: string;
              message?: string;
              detail?: { operationId?: string };
            };
          };
        };
        const body = e.response?.data,
          code = body?.code ?? body?.error;
        if (code === "PERMIT_IN_FLIGHT") {
          // The backend idempotency path returns our own accepted request.
          // A different in-flight operation is not proof that THIS signature ran.
          throw new RefundFailure(
            code,
            `Another operation is in flight${body?.detail?.operationId ? ` (${body.detail.operationId})` : ""}. Wait for it to finish, then refresh the remaining balances.`
          );
        }
        if (
          e.response &&
          e.response.status < 500 &&
          e.response.status !== 429 &&
          code
        )
          throw new RefundFailure(code, body?.message ?? code);
        throw error;
      }
    },
    async send(chunk) {
      // Re-estimate the exact call immediately before the wallet request.
      // All failures before method.send are definitive: no wallet request exists.
      let send: () => Promise<string>;
      try {
        await scope();
        const toolkit = await estimator(dapp, run.wallet, run.chain),
          contract = await toolkit.wallet.at(chunk.book);
        const method = contract.methodsObject.processRefund(chunk.orders);
        await toolkit.estimate.transfer({
          ...method.toTransferParams(),
          source: run.wallet,
        });
        await scope();
        const header = await toolkit.rpc.getBlockHeader();
        if (!Number.isSafeInteger(header.level) || header.level < 0)
          throw new Error("Chain head is unavailable");
        chunk.afterLevel = header.level;
        persist(run);
        await scope();
        send = async () => (await method.send()).opHash;
      } catch (error) {
        if (error instanceof RefundFailure) throw error;
        throw new RefundFailure(
          resourceError(error)
            ? "OPERATION_RESOURCE_LIMIT"
            : "SIMULATION_FAILED",
          "The exact refund could not be prepared. Nothing was sent; refresh the remaining balances."
        );
      }
      try {
        return await send();
      } catch (error) {
        const e = error as { errorType?: string; name?: string };
        if (e.errorType === "ABORTED_ERROR" || e.name === "AbortedBeaconError")
          throw new RefundFailure(
            "USER_REJECTED",
            "The wallet request was declined."
          );
        throw error;
      }
    },
    async relay(id) {
      return relayOperationSchema.parse(
        (
          await rwaApi.get(`/wallets/${run.wallet}/relay/operations/${id}`, {
            timeout: 10_000,
          })
        ).data
      );
    },
    async chain(hash, chunk) {
      if (
        !isKnownChainId(run.chain) ||
        !/^o[1-9A-HJ-NP-Za-km-z]{50}$/.test(hash)
      )
        throw new Error("Invalid transaction hash or network");
      if (run.mode === "credits" && !chunk.signature)
        throw new Error(
          "The saved permit signature is unavailable; check the original relay operation before retrying."
        );
      const operations = await fetchGetOperationsByHash(run.chain, hash);
      if (!operations.length) return { state: "pending" };
      // One relay hash can include refunds for many users in the same book.
      // Select by the complete signed intent, not the first matching entrypoint.
      const row = operations.find((o) => {
        if (
          o.type !== "transaction" ||
          o.target.address !== chunk.book ||
          o.parameter?.entrypoint !==
            (run.mode === "mvrk" ? "processRefund" : "permitAndExecute")
        )
          return false;
        const value = o.parameter.value;
        if (
          run.mode === "credits" &&
          (!Array.isArray(value) || value.length !== 1)
        )
          return false;
        if (
          run.mode === "credits" &&
          value[0]?.userSignature !== chunk.signature
        )
          return false;
        const orders =
          run.mode === "mvrk" ? value : value[0]?.action?.permitProcessRefund;
        let signer: string;
        try {
          signer =
            run.mode === "mvrk"
              ? o.sender.address
              : getPkhfromPk(value[0]?.userPublicKey);
        } catch {
          return false;
        }
        const decoded = z
          .array(
            z.object({
              orderId: z
                .union([
                  z.string().regex(/^(0|[1-9][0-9]*)$/),
                  z.number().int().nonnegative().safe(),
                ])
                .transform(String),
              orderType: z.enum(["BUY", "SELL"]),
            })
          )
          .safeParse(orders);
        return (
          signer === run.wallet &&
          decoded.success &&
          JSON.stringify(decoded.data) === JSON.stringify(chunk.orders)
        );
      });
      if (!row)
        throw new Error(
          "This transaction does not match the saved refund part."
        );
      if (!row.level || !Number.isSafeInteger(row.level) || !row.block)
        return { state: "pending" };
      if (chunk.afterLevel !== undefined && row.level <= chunk.afterLevel)
        throw new Error("This transaction predates the saved refund request.");
      const rpc = dapp.tezos().rpc;
      const head = await rpc.getBlockHeader();
      if (
        head.level < row.level + 2 ||
        (await rpc.getBlockHash({ block: String(row.level) })) !== row.block
      )
        return { state: "pending" };
      if (row.status === "applied") {
        if (!Number.isSafeInteger(row.counter) || row.counter < 0)
          throw new Error("Refund receipt counter is unavailable");
        const key = `${hash}:${row.counter}:${row.block}`;
        let payouts = receiptPayouts.get(key);
        if (!payouts) {
          const block = await rpc.getBlock({ block: row.block });
          const operation = block.operations
            .flat()
            .find((o) => o.hash === hash);
          const transaction = operation?.contents.find(
            (o) =>
              o.kind === "transaction" &&
              o.counter === String(row.counter) &&
              o.destination === chunk.book &&
              o.parameters?.entrypoint ===
                (run.mode === "mvrk" ? "processRefund" : "permitAndExecute")
          );
          if (!transaction || transaction.kind !== "transaction")
            throw new Error("The chain receipt does not match this refund");
          if (!("metadata" in transaction))
            throw new Error("Refund receipt metadata is unavailable");
          if (transaction.metadata.operation_result.status !== "applied")
            return { state: "pending" };
          payouts = payoutsFromReceipt(
            transaction.metadata.internal_operation_results ?? [],
            chunk.book,
            run.wallet
          );
          receiptPayouts.set(key, payouts);
        }
        return { state: "applied", level: row.level, payouts };
      }
      if (["failed", "backtracked", "skipped"].includes(row.status))
        return { state: "failed" };
      return { state: "pending" };
    },
    async indexed(level) {
      const page = await readRefundPage(run.wallet, run.asset);
      return (
        page.as_of.orderbook.realtime && page.as_of.orderbook.level >= level
      );
    },
  };
}
