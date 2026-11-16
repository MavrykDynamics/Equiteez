import { BigNumber } from "bignumber.js";
import { z } from "zod";

import {
  evmHashSchema,
  intentFundingInstructionsSchema,
  intentOperationRequestSchema,
  intentOperationSchema,
} from "~/lib/apis/intents/intents.schema";
import type {
  IntentFundingInstructions,
  IntentOperation,
  IntentOperationRequest,
  IntentPhase,
} from "~/lib/apis/intents";
import type { IntentRouteOption } from "./intentRoute";

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
  /** Dropped before funding (inputs/account changed, cancelled or rejected). */
  "abandoned",
]);
export type IntentFundingState = z.infer<typeof intentFundingStateSchema>;

export const intentRecordSchema = z.object({
  kind: z.literal("intent"),
  /** Local identity (widget/composite IDs). */
  localId: z.string().min(1),
  account: z.string().min(1),
  env: z.string().min(1),
  /**
   * Operation scope, persisted before the first POST and reused for every
   * retry and GET (backend.md §2). Bearer secret: never logged or shown.
   */
  capability: z.string().min(1),
  idempotencyKey: z.string().min(1),
  /** The exact request body; retries send it unchanged. */
  request: intentOperationRequestSchema,
  /** Set once the backend persisted the operation (202). */
  operationId: z.string().uuid().optional(),
  source: z.object({
    chainId: z.number().int().positive(),
    chainName: z.string().min(1),
    originAsset: z.string().min(1),
    token: z.union([
      z.literal("native"),
      z
        .string()
        .regex(/^0x[0-9a-fA-F]{40}$/)
        .transform((value) => value as `0x${string}`),
    ]),
    symbol: z.string().min(1),
    decimals: z.number().int().nonnegative(),
  }),
  destination: z.object({
    tokenAddress: z.string().min(1),
    tokenId: z.string(),
    symbol: z.string().min(1),
    decimals: z.number().int().nonnegative(),
  }),
  settlementDecimals: z.number().int().nonnegative(),
  /** Estimated output before slippage, settlement units (display only). */
  expectedAmountOut: z.string().regex(/^\d+$/).optional(),
  fundingState: intentFundingStateSchema,
  fundingError: z.string().optional(),
  /**
   * Last published instructions seen, kept for display/support after the API
   * hides them. Never permission to send: funding re-reads the operation.
   */
  lastInstructions: intentFundingInstructionsSchema.optional(),
  /** Funding hash plus wallet replacements, kept locally for support. */
  sourceHashes: z.array(evmHashSchema),
  backend: intentOperationSchema.optional(),
  /** "correlated" only from verified bridge data on a forward identity. */
  receipt: z.enum(["none", "correlated"]),
  /** Consecutive 404s; at the limit the capability is treated as lost. */
  notFoundCount: z.number().int().nonnegative().optional(),
  access: z.enum(["ok", "lost"]).optional(),
  announced: z.boolean().optional(),
  isWidgetRequested: z.boolean().optional(),
  createdAt: z.number().int().nonnegative(),
  sequence: z.number().int().nonnegative(),
});
export type IntentRecord = z.infer<typeof intentRecordSchema>;

const phaseRank: Record<IntentPhase, number> = {
  PREPARING_QUOTE: 0,
  AWAITING_DEPOSIT: 1,
  SWAP_IN_PROGRESS: 2,
  VERIFYING_DELIVERY: 3,
  DELIVERY_VERIFIED: 4,
  FORWARDING: 5,
  WRAPPED: 6,
  // Unknown values never move progress backwards or forwards.
  UNKNOWN: -1,
};
export const getIntentPhaseRank = (phase: IntentPhase) => phaseRank[phase];

/**
 * Backend merge. Older revisions are ignored. The same revision is accepted
 * because projected evidence (settlement, delivery) changes independently
 * of the stored row (backend.md §3). A confirmed settlement is never undone
 * by a later projection.
 */
export function mergeIntentSnapshot(
  previous: IntentOperation | undefined,
  next: IntentOperation
): IntentOperation {
  if (!previous) return next;
  if (previous.id !== next.id) return previous;
  if (next.revision < previous.revision) return previous;
  if (
    next.revision === previous.revision &&
    getIntentPhaseRank(next.phase) < getIntentPhaseRank(previous.phase)
  )
    return previous;
  const merged =
    previous.settlement.status === "CONFIRMED" &&
    next.settlement.status !== "CONFIRMED"
      ? { ...next, settlement: previous.settlement }
      : next;
  return JSON.stringify(merged) === JSON.stringify(previous)
    ? previous
    : merged;
}

/** Funds reached 1Click (or later stages) according to the backend. */
export function hasIntentFundsObserved(operation: IntentOperation | undefined) {
  if (!operation) return false;
  return (
    operation.fundingStatus === "OBSERVED" ||
    getIntentPhaseRank(operation.phase) >= phaseRank.SWAP_IN_PROGRESS ||
    (operation.providerStatus !== null &&
      operation.providerStatus !== "PENDING_DEPOSIT") ||
    operation.delivery.status !== "NOT_OBSERVED" ||
    operation.refund !== null
  );
}

/**
 * Verified Mavryk receipt from the backend's settlement evidence: CONFIRMED,
 * at least one mint, and the verified destination asset is the one this
 * operation was created for. A ticker alone is insufficient (backend.md §6).
 */
export function getIntentSettlementReceipt(
  record: IntentRecord
): "confirmed" | "mismatch" | null {
  const settlement = record.backend?.settlement;
  if (settlement?.status !== "CONFIRMED") return null;
  const { tokenAddress, tokenId, mints } = settlement;
  return mints.length > 0 &&
    tokenAddress === record.destination.tokenAddress &&
    tokenId === record.destination.tokenId
    ? "confirmed"
    : "mismatch";
}

/** Tokens arrived on Mavryk: backend settlement or correlated bridge data. */
export const hasIntentArrived = (record: IntentRecord) =>
  getIntentSettlementReceipt(record) === "confirmed" ||
  record.receipt === "correlated";

/** The wallet was asked (or may have been) to send this operation's funds. */
export const hasIntentFundingStarted = (record: IntentRecord) =>
  ["prompted", "broadcast", "confirmed", "unknown", "reverted"].includes(
    record.fundingState
  );

/**
 * No further backend progress is expected: arrival, quote rejection,
 * reported refund, settlement on an unexpected token, lost access, or
 * instructions that expired while nothing was sent.
 */
export function isIntentClosed(record: IntentRecord) {
  if (record.access === "lost") return true;
  if (hasIntentArrived(record)) return true;
  const backend = record.backend;
  if (!backend) return false;
  if (getIntentSettlementReceipt(record) === "mismatch") return true;
  if (backend.closure === "QUOTE_REJECTED") return true;
  if (backend.refund !== null) return true;
  return (
    backend.fundingStatus === "EXPIRED" &&
    !hasIntentFundsObserved(backend) &&
    !["prompted", "broadcast", "confirmed", "unknown"].includes(
      record.fundingState
    )
  );
}

export function createIntentRecord({
  localId,
  account,
  env,
  option,
  request,
  credentials,
  expectedAmountOut,
  now = Date.now(),
}: {
  localId: string;
  account: string;
  env: string;
  option: IntentRouteOption;
  request: IntentOperationRequest;
  credentials: { capability: string; idempotencyKey: string };
  expectedAmountOut?: string;
  now?: number;
}): IntentRecord {
  const { source, destination, route } = option;
  if (!source || !destination)
    throw new Error("The route is not configured for Equiteez.");
  return {
    kind: "intent",
    localId,
    account,
    env,
    capability: credentials.capability,
    idempotencyKey: credentials.idempotencyKey,
    request,
    source: {
      chainId: source.chainId,
      chainName: source.chainName,
      originAsset: source.originAsset,
      token: source.token,
      symbol: source.symbol,
      decimals: route.sourceDecimals,
    },
    destination: {
      tokenAddress: destination.tokenAddress,
      tokenId: destination.tokenId,
      symbol: destination.symbol,
      decimals: destination.decimals,
    },
    settlementDecimals: route.settlementDecimals,
    expectedAmountOut,
    fundingState: "not_started",
    sourceHashes: [],
    receipt: "none",
    createdAt: now,
    sequence: 0,
  };
}

const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

/**
 * The backend operation must echo the exact request the user confirmed.
 * A mismatch is never funded.
 */
export function getOperationMismatch(
  record: IntentRecord,
  operation: IntentOperation
): string | null {
  const { request } = record;
  if (record.operationId && operation.id !== record.operationId)
    return "operation";
  if (operation.recipient !== request.recipient) return "recipient";
  if (operation.routeId !== request.routeId) return "route";
  if (operation.routeVersion !== request.routeVersion) return "route version";
  if (operation.amountIn !== request.amountIn) return "amount";
  if (!same(operation.sourceAddress, request.sourceAddress)) return "source";
  if (!same(operation.refundAddress, request.refundAddress)) return "refund";
  if (operation.slippageBps !== request.slippageBps) return "slippage";
  if (operation.acceptedMinAmountOut !== request.acceptedMinAmountOut)
    return "minimum output";
  return null;
}

/**
 * Published instructions must match the route the user chose: network,
 * provider asset, exact amount, no memo, and a minimum at or above the
 * accepted one. Anything else is never sent to the wallet.
 */
export function getInstructionsMismatch(
  record: IntentRecord,
  instructions: IntentFundingInstructions
): string | null {
  if (instructions.sourceChainId !== String(record.source.chainId))
    return "network";
  if (instructions.originAsset !== record.source.originAsset) return "asset";
  if (instructions.amount !== record.request.amountIn) return "amount";
  if (instructions.depositMemo !== null) return "memo";
  if (
    new BigNumber(instructions.bridgeableMinAmountOut).lt(
      record.request.acceptedMinAmountOut
    )
  )
    return "minimum output";
  return null;
}

/** Forward-event identity `hash:logIndex`, the bridge join key. */
export const getForwardIdentity = (hash: string, logIndex: number) =>
  `${hash.toLowerCase()}:${logIndex}`;
