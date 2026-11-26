import { BigNumber } from "bignumber.js";
import { z } from "zod";

import {
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
import type { IntentSettlement, IntentSourceOption } from "./intentCatalog";
import { isSameNetworkAddress } from "./intentNetworks";

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
  /**
   * The user reported sending the deposit outside Equiteez (another wallet
   * or an exchange). Never prompts a wallet; tracking waits for 1Click.
   */
  "external",
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
  /** The source asset, as offered by metadata when the user confirmed. */
  source: z.object({
    assetId: z.string().min(1),
    network: z.string().min(1),
    networkName: z.string().min(1),
    family: z.enum(["evm", "solana", "near", "aptos", "bitcoin"]),
    evmChainId: z.number().int().positive().nullable(),
    kind: z.enum(["native", "token"]),
    contractAddress: z.string().nullable(),
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
  /** Preview's expected amount on Mavryk, FA2 units (display only). */
  expectedDestinationAmount: z.string().regex(/^\d+$/).optional(),
  /**
   * Connected wallet the deposit will be sent from, when the user reviewed it
   * with one. Funding refuses another account. Absent for manual deposits.
   */
  sourceWallet: z.string().min(1).optional(),
  /** Non-EVM wallet (adapter wallet ID and name) the deposit is sent from. */
  sourceWalletId: z.string().min(1).optional(),
  sourceWalletName: z.string().min(1).optional(),
  fundingState: intentFundingStateSchema,
  fundingError: z.string().optional(),
  /**
   * Last published instructions seen, kept for display/support after the API
   * hides them. Never permission to send: funding re-reads the operation.
   */
  lastInstructions: intentFundingInstructionsSchema.optional(),
  /** Wallet funding hash plus replacements, kept locally for support. */
  sourceHashes: z.array(z.string().min(1).max(256)),
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
  [
    "prompted",
    "broadcast",
    "confirmed",
    "unknown",
    "reverted",
    "external",
  ].includes(record.fundingState);

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
    !["prompted", "broadcast", "confirmed", "unknown", "external"].includes(
      record.fundingState
    )
  );
}

export function createIntentRecord({
  localId,
  account,
  env,
  option,
  settlement,
  request,
  credentials,
  expectedDestinationAmount,
  sourceWallet,
  now = Date.now(),
}: {
  localId: string;
  account: string;
  env: string;
  option: IntentSourceOption;
  settlement: IntentSettlement;
  request: IntentOperationRequest;
  credentials: { capability: string; idempotencyKey: string };
  expectedDestinationAmount?: string;
  /** EVM wallet address, or a non-EVM wallet account. */
  sourceWallet?:
    | string
    | { walletId: string; walletName: string; address: string };
  now?: number;
}): IntentRecord {
  const { asset, network } = option;
  if (asset.kind === "UNKNOWN" || asset.family === "UNKNOWN")
    throw new Error("This asset is not supported in Equiteez.");
  return {
    kind: "intent",
    localId,
    account,
    env,
    capability: credentials.capability,
    idempotencyKey: credentials.idempotencyKey,
    request,
    source: {
      assetId: asset.assetId,
      network: network.key,
      networkName: network.name,
      family: network.family,
      evmChainId: network.evmChainId,
      kind: asset.kind,
      contractAddress: asset.contractAddress,
      symbol: asset.symbol,
      decimals: asset.decimals,
    },
    destination: {
      tokenAddress: settlement.destination.tokenAddress,
      tokenId: settlement.destination.tokenId,
      symbol: settlement.destination.symbol,
      decimals: settlement.destination.decimals,
    },
    settlementDecimals: settlement.decimals,
    expectedDestinationAmount,
    ...(typeof sourceWallet === "string"
      ? { sourceWallet: sourceWallet.toLowerCase() }
      : sourceWallet
        ? {
            sourceWallet: sourceWallet.address,
            sourceWalletId: sourceWallet.walletId,
            sourceWalletName: sourceWallet.walletName,
          }
        : {}),
    fundingState: "not_started",
    sourceHashes: [],
    receipt: "none",
    createdAt: now,
    sequence: 0,
  };
}

/**
 * The backend operation must echo the exact request the user confirmed.
 * An EVM refund address comes back lower-cased; others exactly as sent
 * (backend.md §6.3). A mismatch is never funded.
 */
export function getOperationMismatch(
  record: IntentRecord,
  operation: IntentOperation
): string | null {
  const { request } = record;
  if (record.operationId && operation.id !== record.operationId)
    return "operation";
  if (operation.recipient !== request.recipient) return "recipient";
  if (operation.sourceAssetId !== request.sourceAssetId) return "asset";
  if (
    operation.settlementTokenId !== request.settlementTokenId ||
    operation.settlementTokenVersion !== request.settlementTokenVersion
  )
    return "settlement token";
  if (operation.amountIn !== request.amountIn) return "amount";
  if (
    !isSameNetworkAddress(
      record.source,
      operation.refundAddress,
      request.refundAddress
    )
  )
    return "refund";
  if (operation.slippageBps !== request.slippageBps) return "slippage";
  if (operation.acceptedMinAmountOut !== request.acceptedMinAmountOut)
    return "minimum output";
  return null;
}

/**
 * Published instructions must match the request: network, asset, exact
 * amount, and a minimum at or above the accepted one. Anything else is never
 * shown as a deposit address or sent to a wallet.
 */
export function getInstructionsMismatch(
  record: IntentRecord,
  instructions: IntentFundingInstructions
): string | null {
  if (instructions.sourceNetwork !== record.source.network) return "network";
  if (instructions.originAsset !== record.request.sourceAssetId) return "asset";
  if (instructions.amount !== record.request.amountIn) return "amount";
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
