import { BigNumber } from "bignumber.js";
import { v4 as uuid } from "uuid";
import { z } from "zod";

import { USDT_BRIDGE } from "~/consts/usdtBridge";
import {
  isIdempotencyKey,
  isOperationCapability,
} from "~/lib/intents/intentCapability";
import {
  intentOperationRequestSchema,
  intentOperationSchema,
} from "./intents.schema";
import {
  IntentsApiError,
  type IntentErrorCode,
  type IntentMetadata,
  type IntentOperation,
  type IntentRoute,
  type IntentsApi,
} from "./intents.types";

/**
 * In-browser simulator of the Mavryk Bridge ETH backend (API 0.1.0) for
 * building and testing the UI without the shared environment. Never enabled
 * in production builds (INTENTS_API_MODE=mock).
 *
 * Force a branch with `?intentsMock=<scenario>`:
 * - `reject`      quote rejected (closure QUOTE_REJECTED)
 * - `expire`      instructions expire 20s after publication
 * - `paused`      funding PAUSED / attention ROUTE_PAUSED
 * - `unavailable` POST fails with 503 DEPENDENCY_UNAVAILABLE
 * - `refund`      provider reports a refund after the deposit
 * - `incomplete`  attention DEPOSIT_INCOMPLETE after the deposit
 * - `review`      attention MANUAL_REVIEW after delivery
 * - `untracked`   WRAPPED with settlement NOT_TRACKED (bridge data only)
 * - `registrationConflict` hash registration fails with
 *                 REHEARSAL_DELIVERY_CONFLICT (no progress, under review)
 *
 * Like Basenet, the USDT route is a fixed 1-token rehearsal with
 * connected-wallet hash registration: the first registration answers
 * REHEARSAL_RECEIPT_PENDING, the next one is accepted and starts the
 * lifecycle. The ETH route needs a quote preview and the Base USDC route has
 * no metadata, so both show as unavailable.
 */
export const intentsMockScenarios = [
  "reject",
  "expire",
  "paused",
  "unavailable",
  "refund",
  "incomplete",
  "review",
  "untracked",
  "registrationConflict",
] as const;
export type IntentsMockScenario = (typeof intentsMockScenarios)[number];

const MOCK_FACTORY = "0x00000000000000000000000000000000000fac70" as const;

const units = (amount: number, decimals: number) =>
  new BigNumber(amount).shiftedBy(decimals).toFixed();

export const mockIntentRoutes: IntentRoute[] = [
  {
    id: "mock-arb-sepolia-usdt",
    version: 1,
    enabled: true,
    sourceChainId: "421614",
    settlementChainId: String(USDT_BRIDGE.chainId),
    originAsset: "mock:arb-sepolia:usdt",
    destinationAsset: "mock:arb-sepolia:usdt",
    settlementToken: USDT_BRIDGE.sourceToken.address,
    factoryAddress: MOCK_FACTORY,
    bridgeAddress: USDT_BRIDGE.address,
    sourceDecimals: 18,
    settlementDecimals: USDT_BRIDGE.sourceToken.decimals,
    // Fixed 1-token rehearsal, like basenet-rehearsal-k8s.
    minAmountIn: units(1, 18),
    maxAmountIn: units(1, 18),
    minAmountOut: units(1, USDT_BRIDGE.sourceToken.decimals),
    maxSlippageBps: 0,
  },
  {
    id: "mock-sepolia-eth",
    version: 1,
    enabled: true,
    sourceChainId: "11155111",
    settlementChainId: String(USDT_BRIDGE.chainId),
    originAsset: "mock:sepolia:eth",
    destinationAsset: "mock:arb-sepolia:usdt",
    settlementToken: USDT_BRIDGE.sourceToken.address,
    factoryAddress: MOCK_FACTORY,
    bridgeAddress: USDT_BRIDGE.address,
    sourceDecimals: 18,
    settlementDecimals: USDT_BRIDGE.sourceToken.decimals,
    minAmountIn: units(0.001, 18),
    maxAmountIn: units(5, 18),
    minAmountOut: units(1, 18),
    maxSlippageBps: 300,
  },
  {
    // Listed by the backend but not approved in Equiteez product config.
    id: "mock-base-sepolia-usdc",
    version: 1,
    enabled: true,
    sourceChainId: "84532",
    settlementChainId: String(USDT_BRIDGE.chainId),
    originAsset: "mock:base-sepolia:usdc",
    destinationAsset: "mock:arb-sepolia:usdt",
    settlementToken: USDT_BRIDGE.sourceToken.address,
    factoryAddress: MOCK_FACTORY,
    bridgeAddress: USDT_BRIDGE.address,
    sourceDecimals: 6,
    settlementDecimals: USDT_BRIDGE.sourceToken.decimals,
    minAmountIn: units(1, 6),
    maxAmountIn: units(10_000, 6),
    minAmountOut: units(0.5, 18),
    maxSlippageBps: 300,
  },
];

const mockDestinationAsset = {
  chainId: "NetXbasenetMock",
  kind: "fa2",
  contractAddress: USDT_BRIDGE.destinationToken.address,
  tokenId: USDT_BRIDGE.destinationToken.id,
  decimals: USDT_BRIDGE.destinationToken.decimals,
};
const mockSettlementAsset = {
  assetId: "mock:arb-sepolia:usdt",
  chainId: String(USDT_BRIDGE.chainId),
  kind: "erc20" as const,
  contractAddress: USDT_BRIDGE.sourceToken.address,
  symbol: "Mock USDT",
  decimals: USDT_BRIDGE.sourceToken.decimals,
};
const limitsOf = (route: IntentRoute) => ({
  minAmountIn: route.minAmountIn,
  maxAmountIn: route.maxAmountIn,
  minAmountOut: route.minAmountOut,
  maxSlippageBps: route.maxSlippageBps,
});

/** `GET /v1/metadata`; the Base USDC route is deliberately not described. */
export const mockIntentMetadata: IntentMetadata = {
  admissionPaused: false,
  routes: [
    {
      routeId: mockIntentRoutes[0].id,
      routeVersion: mockIntentRoutes[0].version,
      mode: "rehearsal",
      previewSupported: false,
      sourceAsset: mockSettlementAsset,
      settlementAsset: mockSettlementAsset,
      destinationAsset: mockDestinationAsset,
      limits: limitsOf(mockIntentRoutes[0]),
      depositRegistrationSupported: true,
    },
    {
      routeId: mockIntentRoutes[1].id,
      routeVersion: mockIntentRoutes[1].version,
      mode: "real",
      previewSupported: false,
      sourceAsset: {
        assetId: "mock:sepolia:eth",
        chainId: "11155111",
        kind: "native",
        contractAddress: null,
        symbol: "ETH",
        decimals: 18,
      },
      settlementAsset: mockSettlementAsset,
      destinationAsset: mockDestinationAsset,
      limits: limitsOf(mockIntentRoutes[1]),
      depositRegistrationSupported: false,
    },
  ],
};
const isRehearsal = (routeId: string) =>
  mockIntentMetadata.routes.some(
    (item) => item.routeId === routeId && item.mode === "rehearsal"
  );

/** Settlement tokens per source token, before the 0.3% simulated fee. */
const rates: Record<string, number> = {
  "mock:arb-sepolia:usdt": 1,
  "mock:sepolia:eth": 3_000,
  "mock:base-sepolia:usdc": 1,
};

/** Elapsed ms after the simulated deposit for each stage. */
const QUOTE_AFTER_MS = 1_500;
const timeline = [0, 3_000, 8_000, 12_000, 16_000, 22_000, 32_000] as const;

const storedSchema = z.object({
  operation: intentOperationSchema,
  capability: z.string(),
  idempotencyKey: z.string(),
  request: z.string(),
  createdAt: z.number(),
  depositedAt: z.number().optional(),
  /** bridgeableAmountOut of the funded quote (instructions are hidden later). */
  quotedAmountOut: z.string().optional(),
  /** Index of the last applied timeline stage. */
  stage: z.number().int().optional(),
  /** Hash bound by POST /deposit, and attempts seen before acceptance. */
  registeredHash: z.string().optional(),
  registrationAttempts: z.number().int().optional(),
  scenario: z.string().optional(),
});
type Stored = z.infer<typeof storedSchema>;
const stateSchema = z.object({ operations: z.array(storedSchema) });

const STORAGE_KEY = "equiteez:intents-mock:v2";

type MockOptions = {
  storage?: () => Pick<Storage, "getItem" | "setItem">;
  now?: () => number;
  latencyMs?: number;
  depositAddress: `0x${string}`;
  getScenario?: () => IntentsMockScenario | null;
};

const randomHex = (bytes: number) =>
  `0x${Array.from({ length: bytes }, () =>
    Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, "0")
  ).join("")}` as `0x${string}`;

const fail = (code: IntentErrorCode, status: number, message: string) =>
  new IntentsApiError(code, message, status, uuid());

export function getMockScenarioFromLocation(): IntentsMockScenario | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get("intentsMock");
  return (intentsMockScenarios as readonly string[]).includes(value ?? "")
    ? (value as IntentsMockScenario)
    : null;
}

const iso = (at: number) => new Date(at).toISOString();

export function createIntentsMockApi({
  storage = () => window.sessionStorage,
  now = Date.now,
  latencyMs = 300,
  depositAddress,
  getScenario = getMockScenarioFromLocation,
}: MockOptions): IntentsApi {
  // Memory fallback keeps the simulator usable when storage is blocked.
  let memory: Stored[] = [];
  const read = (): Stored[] => {
    try {
      const raw = storage().getItem(STORAGE_KEY);
      memory = raw ? stateSchema.parse(JSON.parse(raw)).operations : memory;
    } catch {
      // Keep the in-memory copy.
    }
    return memory;
  };
  const write = (operations: Stored[]) => {
    memory = operations;
    try {
      storage().setItem(STORAGE_KEY, JSON.stringify({ operations }));
    } catch {
      // Session-only simulator state.
    }
  };
  const delay = (signal?: AbortSignal) =>
    new Promise<void>((resolve, reject) => {
      if (signal?.aborted) return reject(signal.reason);
      if (!latencyMs) return resolve();
      const timer = setTimeout(resolve, latencyMs);
      signal?.addEventListener("abort", () => {
        clearTimeout(timer);
        reject(signal.reason);
      });
    });

  /** Applies every clock-driven transition that is due, once, persistently. */
  const advance = (stored: Stored): Stored => {
    const at = now();
    let op = stored.operation;
    let { stage } = stored;
    const route = mockIntentRoutes.find((item) => item.id === op.routeId)!;
    const bump = (patch: Partial<IntentOperation>, when: number) => {
      op = {
        ...op,
        ...patch,
        revision: op.revision + 1,
        updatedAt: iso(when),
        lastCheckedAt: iso(when),
      };
    };

    // Quote preparation.
    if (op.phase === "PREPARING_QUOTE" && op.closure === "OPEN") {
      const quotedAt = stored.createdAt + QUOTE_AFTER_MS;
      if (at >= quotedAt) {
        const amountOut = new BigNumber(op.amountIn)
          .shiftedBy(-route.sourceDecimals)
          .times(rates[route.originAsset] ?? 1)
          // The rehearsal settles 1:1; provider routes charge a fee.
          .times(isRehearsal(route.id) ? 1 : 0.997)
          .shiftedBy(route.settlementDecimals)
          .integerValue(BigNumber.ROUND_DOWN);
        const minAmountOut = amountOut
          .times(10_000 - op.slippageBps)
          .div(10_000)
          .integerValue(BigNumber.ROUND_DOWN);
        const step = new BigNumber(10).pow(
          route.settlementDecimals - USDT_BRIDGE.destinationToken.decimals
        );
        const floor = (value: BigNumber) =>
          value.div(step).integerValue(BigNumber.ROUND_DOWN).times(step);
        if (
          stored.scenario === "reject" ||
          floor(minAmountOut).lt(op.acceptedMinAmountOut)
        )
          bump({ closure: "QUOTE_REJECTED", retryAfterMs: 5_000 }, quotedAt);
        else {
          const expiresAt =
            quotedAt + (stored.scenario === "expire" ? 20_000 : 10 * 60_000);
          bump(
            {
              phase: "AWAITING_DEPOSIT",
              fundingStatus:
                stored.scenario === "paused" ? "PAUSED" : "AVAILABLE",
              attention: stored.scenario === "paused" ? "ROUTE_PAUSED" : "NONE",
              providerStatus: "PENDING_DEPOSIT",
              retryAfterMs: 2_000,
              fundingInstructions: {
                quoteId: uuid(),
                sourceChainId: route.sourceChainId,
                originAsset: route.originAsset,
                depositAddress,
                depositMemo: null,
                amount: op.amountIn,
                amountOut: amountOut.toFixed(),
                minAmountOut: minAmountOut.toFixed(),
                bridgeableAmountOut: floor(amountOut).toFixed(),
                bridgeableMinAmountOut: floor(minAmountOut).toFixed(),
                deadline: iso(expiresAt + 60_000),
                fundingExpiresAt: iso(expiresAt),
                forwarderAddress: randomHex(20),
              },
              nextCheckAt: iso(quotedAt + 2_000),
            },
            quotedAt
          );
        }
      }
    }

    // Published instructions that were never funded expire.
    const instructions = op.fundingInstructions;
    if (
      stored.depositedAt === undefined &&
      instructions &&
      at >= Date.parse(instructions.fundingExpiresAt)
    )
      bump(
        { fundingStatus: "EXPIRED", fundingInstructions: null },
        Date.parse(instructions.fundingExpiresAt)
      );

    // Post-deposit lifecycle.
    if (stored.depositedAt !== undefined) {
      const amountOut = stored.quotedAmountOut ?? op.acceptedMinAmountOut;
      const s = stored.scenario;
      for (let index = (stage ?? -1) + 1; index < timeline.length; index++) {
        const when = stored.depositedAt + timeline[index];
        // Scenarios that stop the lifecycle at a stage never advance past it.
        const halted =
          (s === "incomplete" && index >= 2) ||
          (s === "refund" && index >= 3) ||
          (s === "review" && index >= 4) ||
          (s === "untracked" && index >= 6);
        if (at < when || halted) break;
        stage = index;
        if (index === 0)
          bump(
            {
              fundingStatus: "OBSERVED",
              fundingInstructions: null,
              providerStatus: "KNOWN_DEPOSIT_TX",
            },
            when
          );
        else if (index === 1)
          bump(
            s === "incomplete"
              ? {
                  providerStatus: "INCOMPLETE_DEPOSIT",
                  attention: "DEPOSIT_INCOMPLETE",
                }
              : { phase: "SWAP_IN_PROGRESS", providerStatus: "PROCESSING" },
            when
          );
        else if (index === 2)
          bump(
            s === "refund"
              ? {
                  providerStatus: "REFUNDED",
                  attention: "NONE",
                  refund: {
                    status: "REPORTED",
                    amount: op.amountIn,
                    asset:
                      op.fundingInstructions?.originAsset ?? route.originAsset,
                    recipient: op.refundAddress,
                  },
                }
              : {
                  phase: "VERIFYING_DELIVERY",
                  providerStatus: "SUCCESS",
                  delivery: {
                    ...op.delivery,
                    status: "VERIFYING",
                    expectedAmount: amountOut,
                  },
                },
            when
          );
        else if (index === 3)
          bump(
            {
              phase: "DELIVERY_VERIFIED",
              attention: s === "review" ? "MANUAL_REVIEW" : "NONE",
              delivery: {
                status: "VERIFIED",
                expectedAmount: amountOut,
                confirmedAmount: amountOut,
                transferCount: 1,
                transactionHashes: [randomHex(32)],
              },
              forwarding: {
                ...op.forwarding,
                status: "READY",
                bridgeableAmount: amountOut,
                remainingAmount: amountOut,
              },
            },
            when
          );
        else if (index === 4)
          bump(
            {
              phase: "FORWARDING",
              forwarding: {
                ...op.forwarding,
                status: "IN_PROGRESS",
                transactionHash: randomHex(32),
              },
            },
            when
          );
        else if (index === 5)
          bump(
            {
              phase: "WRAPPED",
              forwarding: {
                ...op.forwarding,
                status: "WRAPPED",
                wrappedAmount: amountOut,
                remainingAmount: "0",
                bridgeEvents: [
                  {
                    transactionHash:
                      op.forwarding.transactionHash ?? randomHex(32),
                    logIndex: 0,
                    amount: amountOut,
                  },
                ],
              },
              settlement: {
                ...op.settlement,
                status: s === "untracked" ? "NOT_TRACKED" : "PENDING",
              },
            },
            when
          );
        else if (index === 6) {
          const [event] = op.forwarding.bridgeEvents;
          const minted = new BigNumber(amountOut)
            .shiftedBy(
              USDT_BRIDGE.destinationToken.decimals - route.settlementDecimals
            )
            .integerValue(BigNumber.ROUND_DOWN)
            .toFixed();
          bump(
            {
              settlement: {
                status: "CONFIRMED",
                confirmedAmount: minted,
                tokenAddress: USDT_BRIDGE.destinationToken.address,
                tokenId: USDT_BRIDGE.destinationToken.id,
                mavrykChainId: "NetXbasenetMock",
                mints: [
                  {
                    wrapTransactionHash: event.transactionHash,
                    wrapLogIndex: event.logIndex,
                    operationHash: `oo${randomHex(24).slice(2)}`,
                    blockHash: `BL${randomHex(24).slice(2)}`,
                    level: 1_000_000,
                    amount: minted,
                  },
                ],
              },
            },
            when
          );
        }
      }
    }
    return op === stored.operation
      ? stored
      : { ...stored, operation: op, stage };
  };

  const load = () => {
    const operations = read().map(advance);
    write(operations);
    return operations;
  };
  const find = (capability: string, id: string) => {
    const operations = load();
    const stored = operations.find(
      (item) => item.operation.id === id && item.capability === capability
    );
    // Unknown and foreign operations look the same (backend.md §2).
    if (!stored) throw fail("NOT_FOUND", 404, "Operation not found.");
    return { operations, stored };
  };

  return {
    env: "mock",
    async getRoutes(options) {
      await delay(options?.signal);
      return mockIntentRoutes;
    },
    async getMetadata(options) {
      await delay(options?.signal);
      return mockIntentMetadata;
    },
    async createOperation({ capability, idempotencyKey }, input, options) {
      await delay(options?.signal);
      if (!isOperationCapability(capability))
        throw fail("NOT_FOUND", 404, "Operation not found.");
      if (!isIdempotencyKey(idempotencyKey))
        throw fail("VALIDATION_ERROR", 400, "Invalid Idempotency-Key.");
      const parsed = intentOperationRequestSchema.safeParse(input);
      if (!parsed.success)
        throw fail("VALIDATION_ERROR", 400, "Invalid request body.");
      const request = parsed.data;
      const body = JSON.stringify({
        ...request,
        sourceAddress: request.sourceAddress.toLowerCase(),
        refundAddress: request.refundAddress.toLowerCase(),
      });
      const operations = load();
      const existing = operations.find(
        (item) =>
          item.capability === capability &&
          item.idempotencyKey === idempotencyKey
      );
      if (existing) {
        if (existing.request !== body)
          throw fail(
            "IDEMPOTENCY_CONFLICT",
            409,
            "The idempotency key is bound to another request."
          );
        return { operation: existing.operation, replayed: true };
      }
      const scenario = getScenario();
      if (scenario === "unavailable")
        throw fail("DEPENDENCY_UNAVAILABLE", 503, "Admission is paused.");
      const route = mockIntentRoutes.find(
        (item) => item.id === request.routeId
      );
      if (!route?.enabled || route.version !== request.routeVersion)
        throw fail("ROUTE_UNAVAILABLE", 409, "This route is unavailable.");
      const amount = new BigNumber(request.amountIn);
      if (amount.lt(route.minAmountIn) || amount.gt(route.maxAmountIn))
        throw fail("AMOUNT_OUT_OF_RANGE", 400, "Amount outside route bounds.");
      if (request.slippageBps > route.maxSlippageBps)
        throw fail("SLIPPAGE_OUT_OF_RANGE", 400, "Slippage too high.");
      if (new BigNumber(request.acceptedMinAmountOut).lt(route.minAmountOut))
        throw fail("MIN_OUTPUT_TOO_LOW", 400, "Accepted output too low.");
      if (
        isRehearsal(route.id) &&
        (request.sourceAddress.toLowerCase() !==
          request.refundAddress.toLowerCase() ||
          request.slippageBps !== 0 ||
          request.acceptedMinAmountOut !== route.minAmountOut)
      )
        throw fail(
          "REHEARSAL_SCOPE_MISMATCH",
          409,
          "The rehearsal accepts only its fixed transfer."
        );
      const createdAt = now();
      const operation: IntentOperation = {
        ...(JSON.parse(body) as typeof request),
        id: uuid(),
        phase: "PREPARING_QUOTE",
        attention: "NONE",
        closure: "OPEN",
        revision: 1,
        fundingStatus: "NOT_READY",
        fundingInstructions: null,
        providerStatus: null,
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
        createdAt: iso(createdAt),
        updatedAt: iso(createdAt),
        lastCheckedAt: null,
        nextCheckAt: iso(createdAt + QUOTE_AFTER_MS),
        retryAfterMs: QUOTE_AFTER_MS,
      };
      write([
        ...operations,
        {
          operation,
          capability,
          idempotencyKey,
          request: body,
          createdAt,
          scenario: scenario ?? undefined,
        },
      ]);
      return { operation, replayed: false };
    },
    async getOperation(capability, id, options) {
      await delay(options?.signal);
      return find(capability, id).stored.operation;
    },
    async registerDeposit(capability, id, transactionHash, options) {
      await delay(options?.signal);
      const { operations, stored } = find(capability, id);
      const hash = transactionHash.toLowerCase();
      if (!/^0x[0-9a-f]{64}$/.test(hash))
        throw fail("VALIDATION_ERROR", 400, "Invalid transaction hash.");
      if (stored.registeredHash) {
        if (stored.registeredHash !== hash)
          throw fail(
            "REHEARSAL_DELIVERY_CONFLICT",
            409,
            "The operation is bound to another transaction."
          );
        return { replayed: true };
      }
      if (stored.scenario === "registrationConflict")
        throw fail(
          "REHEARSAL_DELIVERY_CONFLICT",
          409,
          "The forwarder already holds a delivery for another operation."
        );
      if (stored.operation.fundingStatus !== "AVAILABLE")
        throw fail(
          "REHEARSAL_QUOTE_NOT_PUBLISHED",
          409,
          "No published funding instructions."
        );
      const attempts = (stored.registrationAttempts ?? 0) + 1;
      if (attempts === 1) {
        write(
          operations.map((item) =>
            item === stored ? { ...item, registrationAttempts: attempts } : item
          )
        );
        throw new IntentsApiError(
          "REHEARSAL_RECEIPT_PENDING",
          "Receipt or confirmations pending.",
          409,
          uuid(),
          3_000
        );
      }
      write(
        operations.map((item) =>
          item === stored
            ? advance({
                ...item,
                registeredHash: hash,
                registrationAttempts: attempts,
                depositedAt: now(),
                quotedAmountOut:
                  item.operation.fundingInstructions?.bridgeableAmountOut,
              })
            : item
        )
      );
      return { replayed: false };
    },
  };
}
