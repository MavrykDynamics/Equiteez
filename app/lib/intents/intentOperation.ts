import { z } from "zod";

import {
  evmHashSchema,
  intentFundingSchema,
  intentOperationSchema,
} from "~/lib/apis/intents/intents.schema";
import type {
  IntentOperation,
  IntentRoute,
  IntentStatus,
} from "~/lib/apis/intents";

/**
 * Frontend record of one 1Click deposit. It is kept apart from the direct
 * bridge records: its source hash is a 1Click funding transfer and never a
 * bridge lock hash.
 */
export const intentFundingStateSchema = z.enum([
  /** No wallet request yet. A new funding request is allowed. */
  "not_started",
  /** Wallet asked to sign. A reload in this state must not prompt again. */
  "prompted",
  /** Wallet returned a hash; waiting for the source receipt. */
  "broadcast",
  "confirmed",
  /** Outcome unknown (RPC error, timeout, replaced). Never auto-retried. */
  "unknown",
  /** User declined in the wallet; nothing was broadcast. */
  "rejected",
  /** Source transaction mined but reverted. */
  "reverted",
  /** Quote dropped before funding (inputs/account changed or cancelled). */
  "abandoned",
]);
export type IntentFundingState = z.infer<typeof intentFundingStateSchema>;

export const intentRecordSchema = z.object({
  kind: z.literal("intent"),
  /** Created before POST /operations; doubles as the idempotency key. */
  localId: z.string().min(1),
  operationId: z.string().min(1).optional(),
  account: z.string().min(1),
  env: z.string().min(1),
  routeId: z.string().min(1),
  recipient: z.string().min(1),
  sourceAddress: z.string().regex(/^0x[0-9a-fA-F]{40}$/),
  source: z.object({
    chainId: z.number().int().positive(),
    chainName: z.string().min(1),
    symbol: z.string().min(1),
    decimals: z.number().int().nonnegative(),
  }),
  destination: z.object({
    tokenAddress: z.string().min(1),
    tokenId: z.string(),
    symbol: z.string().min(1),
    decimals: z.number().int().nonnegative(),
  }),
  amountIn: z.string().regex(/^\d+$/),
  amountOut: z.string().regex(/^\d+$/).optional(),
  minAmountOut: z.string().regex(/^\d+$/).optional(),
  quoteExpiresAt: z.string().optional(),
  funding: intentFundingSchema.optional(),
  fundingState: intentFundingStateSchema,
  fundingError: z.string().optional(),
  /** Funding hash plus wallet replacements. Never used as a bridge lock hash. */
  sourceHashes: z.array(evmHashSchema),
  hintState: z.enum(["none", "pending", "sent", "failed"]),
  backend: intentOperationSchema.optional(),
  /** "correlated" only from a verified forward-event identity (EQ-FE-05). */
  receipt: z.enum(["none", "correlated"]),
  announced: z.boolean().optional(),
  isWidgetRequested: z.boolean().optional(),
  createdAt: z.number().int().nonnegative(),
  sequence: z.number().int().nonnegative(),
});
export type IntentRecord = z.infer<typeof intentRecordSchema>;

const statusRank: Record<IntentStatus, number> = {
  awaiting_deposit: 0,
  deposit_detected: 1,
  swapping: 2,
  delivered: 3,
  forwarding: 4,
  wrapped: 5,
  refunded: 6,
  expired: 6,
  failed: 6,
};

/**
 * `wrapped` ends the backend's authority (EVM WRAPPED). It is final for the
 * backend snapshot but NOT proof that tokens arrived on Mavryk.
 */
export const isTerminalIntentStatus = (status: IntentStatus) =>
  statusRank[status] >= statusRank.wrapped;
export const isFailedIntentStatus = (status: IntentStatus) =>
  status === "refunded" || status === "expired" || status === "failed";

/**
 * Monotonic backend merge: older versions, out-of-order responses, backward
 * status moves and anything after a terminal status are ignored. Identity
 * fields learned earlier are never dropped by a sparser snapshot.
 */
export function mergeIntentSnapshot(
  previous: IntentOperation | undefined,
  next: IntentOperation
): IntentOperation {
  if (!previous) return next;
  if (previous.id !== next.id) return previous;
  if (isTerminalIntentStatus(previous.status)) return previous;
  if (next.version < previous.version) return previous;
  if (
    next.version === previous.version &&
    Date.parse(next.updatedAt) <= Date.parse(previous.updatedAt)
  )
    return previous;
  if (statusRank[next.status] < statusRank[previous.status]) return previous;
  return {
    ...next,
    sourceTxHash: next.sourceTxHash ?? previous.sourceTxHash,
    deliveryTxHash: next.deliveryTxHash ?? previous.deliveryTxHash,
    forwardTxHash: next.forwardTxHash ?? previous.forwardTxHash,
    forwardLogIndex: next.forwardLogIndex ?? previous.forwardLogIndex,
  };
}

export function createIntentRecord({
  localId,
  account,
  env,
  route,
  amountIn,
  sourceAddress,
  now = Date.now(),
}: {
  localId: string;
  account: string;
  env: string;
  route: IntentRoute;
  amountIn: string;
  sourceAddress: string;
  now?: number;
}): IntentRecord {
  return {
    kind: "intent",
    localId,
    account,
    env,
    routeId: route.id,
    recipient: account,
    sourceAddress,
    source: {
      chainId: route.source.chainId,
      chainName: route.source.chainName,
      symbol: route.source.token.symbol,
      decimals: route.source.token.decimals,
    },
    destination: {
      tokenAddress: route.destination.tokenAddress,
      tokenId: route.destination.tokenId,
      symbol: route.destination.symbol,
      decimals: route.destination.decimals,
    },
    amountIn,
    fundingState: "not_started",
    sourceHashes: [],
    hintState: "none",
    receipt: "none",
    createdAt: now,
    sequence: 0,
  };
}

/**
 * Checks the backend's executable operation against what the user confirmed.
 * A mismatch is never funded.
 */
export function getOperationMismatch(
  record: IntentRecord,
  operation: IntentOperation,
  route: IntentRoute
): string | null {
  const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();
  if (operation.recipient !== record.recipient) return "recipient";
  if (operation.routeId !== record.routeId) return "route";
  if (operation.amountIn !== record.amountIn) return "amount";
  if (!same(operation.sourceAddress, record.sourceAddress)) return "source";
  if (operation.funding.chainId !== route.source.chainId) return "chain";
  if (operation.funding.amount !== record.amountIn) return "funding amount";
  if (
    route.source.token.address === "native"
      ? operation.funding.token !== "native"
      : operation.funding.token === "native" ||
        !same(operation.funding.token, route.source.token.address)
  )
    return "token";
  return null;
}
