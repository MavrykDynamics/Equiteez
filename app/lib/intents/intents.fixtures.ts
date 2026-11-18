import { arbitrumSepolia, sepolia } from "wagmi/chains";

import { INTENTS_BRIDGE_PAIRS } from "~/consts/intents";
import type {
  IntentFundingInstructions,
  IntentOperation,
  IntentOperationRequest,
} from "~/lib/apis/intents";
import {
  mockIntentMetadata,
  mockIntentRoutes,
} from "~/lib/apis/intents/intents.mock";
import { createIntentRecord, type IntentRecord } from "./intentOperation";
import { resolveIntentRoute } from "./intentRoute";

export const fixtureRecipient = "mv19MAVgCDwzuNMWprbHrUZhznoH8n9NWGWt";
export const fixtureSource =
  "0x1111111111111111111111111111111111111111" as const;
export const fixtureDeposit =
  "0x2222222222222222222222222222222222222222" as const;
export const fixtureCapability = "A".repeat(42) + "E";
export const fixtureOperationId = "8a1f0c4e-2b6d-4c3a-9f10-0d2e7b5c6a11";
export const fixtureQuoteId = "5d0c3a9e-7b21-4f6a-8c44-1e9b2d3f4a55";
export const fixtureRoute = mockIntentRoutes[0];
export const fixtureNativeRoute = mockIntentRoutes[1];
export const fixtureWrapHash = `0x${"c".repeat(64)}` as const;
export const fixtureFundingHash = `0x${"a".repeat(64)}` as const;

export const resolveOption = (route = fixtureRoute) =>
  resolveIntentRoute(route, {
    metadata: mockIntentMetadata,
    bridgePairs: INTENTS_BRIDGE_PAIRS,
    chains: [arbitrumSepolia, sepolia],
  });
export const fixtureOption = resolveOption();

export function request(
  overrides: Partial<IntentOperationRequest> = {}
): IntentOperationRequest {
  return {
    routeId: fixtureRoute.id,
    routeVersion: fixtureRoute.version,
    sourceAddress: fixtureSource,
    recipient: fixtureRecipient,
    refundAddress: fixtureSource,
    amountIn: "2000000000000000000",
    slippageBps: 50,
    acceptedMinAmountOut: "1980050000000000000",
    ...overrides,
  };
}

export function instructions(
  overrides: Partial<IntentFundingInstructions> = {}
): IntentFundingInstructions {
  return {
    quoteId: fixtureQuoteId,
    sourceChainId: fixtureRoute.sourceChainId,
    originAsset: fixtureRoute.originAsset,
    depositAddress: fixtureDeposit,
    depositMemo: null,
    amount: "2000000000000000000",
    amountOut: "1994000000000000000",
    minAmountOut: "1990030000000000000",
    bridgeableAmountOut: "1994000000000000000",
    bridgeableMinAmountOut: "1990030000000000000",
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
      expectedAmount: "1994000000000000000",
      confirmedAmount: "1994000000000000000",
      transferCount: 1,
      transactionHashes: [`0x${"d".repeat(64)}`],
    },
    forwarding: {
      ...base.forwarding,
      status: "WRAPPED",
      transactionHash: fixtureWrapHash,
      wrappedAmount: "1994000000000000000",
      bridgeableAmount: "1994000000000000000",
      bridgeEvents: [
        {
          transactionHash: fixtureWrapHash,
          logIndex: 3,
          amount: "1994000000000000000",
        },
      ],
    },
    settlement:
      settlement === "CONFIRMED"
        ? {
            status: "CONFIRMED",
            confirmedAmount: "1994000",
            tokenAddress: fixtureOption.destination!.tokenAddress,
            tokenId: fixtureOption.destination!.tokenId,
            mavrykChainId: "NetXbasenet",
            mints: [
              {
                wrapTransactionHash: fixtureWrapHash,
                wrapLogIndex: 3,
                operationHash: "ooMint",
                blockHash: "BLMint",
                level: 100,
                amount: "1994000",
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
      request: request(),
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
