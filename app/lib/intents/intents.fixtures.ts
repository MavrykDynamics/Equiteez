import type {
  IntentFundingInstructions,
  IntentOperation,
  IntentOperationRequest,
  IntentPreview,
} from "~/lib/apis/intents";
import { mockIntentMetadata } from "~/lib/apis/intents/intents.mock";
import { resolveIntentCatalog, type IntentSourceOption } from "./intentCatalog";
import { createIntentRecord, type IntentRecord } from "./intentOperation";

export const fixtureRecipient = "mv19MAVgCDwzuNMWprbHrUZhznoH8n9NWGWt";
/** EVM wallet / refund address (lower-case, as the backend echoes it). */
export const fixtureSource =
  "0x1111111111111111111111111111111111111111" as const;
export const fixtureDeposit =
  "0x2222222222222222222222222222222222222222" as const;
export const fixtureSolanaRefund =
  "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm";
export const fixtureCapability = "A".repeat(42) + "E";
export const fixtureOperationId = "8a1f0c4e-2b6d-4c3a-9f10-0d2e7b5c6a11";
export const fixtureQuoteId = "5d0c3a9e-7b21-4f6a-8c44-1e9b2d3f4a55";
export const fixtureWrapHash = `0x${"c".repeat(64)}` as const;
export const fixtureFundingHash = `0x${"a".repeat(64)}` as const;

export const fixtureCatalog = resolveIntentCatalog(mockIntentMetadata);
export const fixtureSettlement = fixtureCatalog.settlement!;
const optionOf = (assetId: string) =>
  fixtureCatalog.options.find((option) => option.assetId === assetId)!;
/** USDC on Base: an EVM token a connected wallet can send. */
export const fixtureOption: IntentSourceOption = optionOf(
  "nep141:base-0x833589fcd6edb6e08f4c7c32d4f71b54bda02913.omft.near"
);
export const fixtureNativeOption = optionOf("nep141:eth.omft.near");
export const fixtureSolanaOption = optionOf("nep141:sol.omft.near");

export function request(
  overrides: Partial<IntentOperationRequest> = {}
): IntentOperationRequest {
  return {
    sourceAssetId: fixtureOption.assetId,
    settlementTokenId: fixtureSettlement.id,
    settlementTokenVersion: fixtureSettlement.version,
    recipient: fixtureRecipient,
    refundAddress: fixtureSource,
    amountIn: "25000000",
    slippageBps: 100,
    acceptedMinAmountOut: "24600000",
    ...overrides,
  };
}

export function preview(overrides: Partial<IntentPreview> = {}): IntentPreview {
  const {
    sourceAssetId,
    settlementTokenId,
    settlementTokenVersion,
    amountIn,
    slippageBps,
  } = request();
  return {
    kind: "indicative",
    executable: false,
    sourceAssetId,
    settlementTokenId,
    settlementTokenVersion,
    amountIn,
    slippageBps,
    amountOut: "24921000",
    minAmountOut: "24600000",
    bridgeableAmountOut: "24921000",
    bridgeableMinAmountOut: "24600000",
    destinationAmountOut: "24921000",
    destinationMinAmountOut: "24600000",
    destinationAsset: mockIntentMetadata.settlementTokens[0].destinationAsset,
    providerTimestamp: "2026-11-13T10:00:00.000Z",
    quotedAt: "2026-11-13T10:00:00.000Z",
    expiresAt: "2026-11-13T10:00:30.000Z",
    providerTimeEstimateSeconds: 35,
    refundFee: "1000",
    withdrawFee: "4000",
    ...overrides,
  };
}

export function instructions(
  overrides: Partial<IntentFundingInstructions> = {}
): IntentFundingInstructions {
  return {
    quoteId: fixtureQuoteId,
    sourceNetwork: fixtureOption.network.key,
    originAsset: fixtureOption.assetId,
    depositAddress: fixtureDeposit,
    depositMemo: null,
    amount: "25000000",
    amountOut: "24921000",
    minAmountOut: "24671000",
    bridgeableAmountOut: "24921000",
    bridgeableMinAmountOut: "24671000",
    deadline: "2026-11-13T10:11:00.000Z",
    fundingExpiresAt: "2026-11-13T10:10:00.000Z",
    forwarderAddress: "0x3333333333333333333333333333333333333333",
    ...overrides,
  };
}

/** A full API projection, by default with instructions published. */
export function operation(
  overrides: Partial<IntentOperation> = {}
): IntentOperation {
  return {
    ...request(),
    id: fixtureOperationId,
    phase: "AWAITING_DEPOSIT",
    attention: "NONE",
    closure: "OPEN",
    revision: 2,
    fundingStatus: "AVAILABLE",
    fundingInstructions: instructions(),
    providerStatus: "PENDING_DEPOSIT",
    delivery: {
      status: "NOT_OBSERVED",
      expectedAmount: null,
      confirmedAmount: "0",
      transferCount: 0,
      transactionHashes: [],
    },
    forwarding: {
      status: "NOT_READY",
      transactionHash: null,
      wrappedAmount: "0",
      bridgeableAmount: "0",
      remainingAmount: "0",
      dustAmount: "0",
      bridgeEvents: [],
    },
    settlement: {
      status: "NOT_TRACKED",
      confirmedAmount: "0",
      tokenAddress: null,
      tokenId: null,
      mavrykChainId: null,
      mints: [],
    },
    refund: null,
    createdAt: "2026-11-13T10:00:00.000Z",
    updatedAt: "2026-11-13T10:00:01.500Z",
    lastCheckedAt: null,
    nextCheckAt: null,
    retryAfterMs: 2_000,
    ...overrides,
  };
}

/** Wrapped, with the given settlement status. */
export function wrappedOperation(
  settlement: IntentOperation["settlement"]["status"] = "PENDING",
  overrides: Partial<IntentOperation> = {}
): IntentOperation {
  const base = operation();
  return operation({
    phase: "WRAPPED",
    revision: 8,
    fundingStatus: "OBSERVED",
    fundingInstructions: null,
    providerStatus: "SUCCESS",
    delivery: {
      status: "VERIFIED",
      expectedAmount: "24921000",
      confirmedAmount: "24921000",
      transferCount: 1,
      transactionHashes: [`0x${"d".repeat(64)}`],
    },
    forwarding: {
      ...base.forwarding,
      status: "WRAPPED",
      transactionHash: fixtureWrapHash,
      wrappedAmount: "24921000",
      bridgeableAmount: "24921000",
      bridgeEvents: [
        {
          transactionHash: fixtureWrapHash,
          logIndex: 3,
          amount: "24921000",
        },
      ],
    },
    settlement:
      settlement === "CONFIRMED"
        ? {
            status: "CONFIRMED",
            confirmedAmount: "24921000",
            tokenAddress: fixtureSettlement.destination.tokenAddress,
            tokenId: fixtureSettlement.destination.tokenId,
            mavrykChainId: "NetXbasenet",
            mints: [
              {
                wrapTransactionHash: fixtureWrapHash,
                wrapLogIndex: 3,
                operationHash: "ooMint",
                blockHash: "BLMint",
                level: 100,
                amount: "24921000",
              },
            ],
          }
        : { ...base.settlement, status: settlement },
    ...overrides,
  });
}

export function record(overrides: Partial<IntentRecord> = {}): IntentRecord {
  return {
    ...createIntentRecord({
      localId: "local-1",
      account: fixtureRecipient,
      env: "mock",
      option: fixtureOption,
      settlement: fixtureSettlement,
      request: request(),
      sourceWallet: fixtureSource,
      credentials: {
        capability: fixtureCapability,
        idempotencyKey: "idem-key-1",
      },
      now: Date.parse("2026-11-13T10:00:00.000Z"),
    }),
    ...overrides,
  };
}

export function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  };
}
