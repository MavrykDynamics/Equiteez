import { BigNumber } from "bignumber.js";
import { z } from "zod";

import { USDT_BRIDGE } from "~/consts/usdtBridge";
import { intentOperationSchema } from "./intents.schema";
import {
  IntentsApiError,
  type IntentOperation,
  type IntentQuoteRequest,
  type IntentRoute,
  type IntentsApi,
  type IntentStatus,
} from "./intents.types";

/**
 * In-browser simulator of the shared 1Click backend, for building the UI before
 * BE-02/BE-03 land. Never enabled in production builds (INTENTS_API_MODE=mock).
 *
 * Force a branch with `?intentsMock=refund|expire|busy|sponsorship|fail|below`.
 */
export type IntentsMockScenario =
  | "refund"
  | "expire"
  | "busy"
  | "sponsorship"
  | "fail"
  | "below";

const destination = {
  network: USDT_BRIDGE.destinationNetwork,
  tokenAddress: USDT_BRIDGE.destinationToken.address,
  tokenId: USDT_BRIDGE.destinationToken.id,
  symbol: USDT_BRIDGE.destinationToken.symbol,
  decimals: USDT_BRIDGE.destinationToken.decimals,
};

export const mockIntentRoutes: IntentRoute[] = [
  {
    id: "arb-sepolia-usdt",
    enabled: true,
    source: {
      chainId: 421614,
      chainName: "Arbitrum Sepolia",
      token: {
        address: USDT_BRIDGE.sourceToken.address,
        symbol: "USDT",
        name: "Mock USDT",
        decimals: 18,
      },
    },
    destination,
    minAmountIn: new BigNumber(1).shiftedBy(18).toFixed(),
    maxAmountIn: new BigNumber(10_000).shiftedBy(18).toFixed(),
  },
  {
    id: "sepolia-eth",
    enabled: true,
    source: {
      chainId: 11155111,
      chainName: "Sepolia",
      token: { address: "native", symbol: "ETH", name: "Ether", decimals: 18 },
    },
    destination,
    minAmountIn: new BigNumber(0.001).shiftedBy(18).toFixed(),
    maxAmountIn: new BigNumber(5).shiftedBy(18).toFixed(),
  },
  {
    // Present in the shared catalog but on a chain Equiteez cannot sign on.
    id: "base-sepolia-usdc",
    enabled: true,
    source: {
      chainId: 84532,
      chainName: "Base Sepolia",
      token: {
        address: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
        symbol: "USDC",
        decimals: 6,
      },
    },
    destination,
    minAmountIn: "1000000",
  },
];

/** Source token → destination units, before the 0.3% simulated fee. */
const rates: Record<string, number> = {
  "arb-sepolia-usdt": 1,
  "sepolia-eth": 3_000,
  "base-sepolia-usdc": 1,
};

// Elapsed milliseconds after the deposit hint for each simulated stage.
const timeline: [number, IntentStatus][] = [
  [0, "awaiting_deposit"],
  [4_000, "deposit_detected"],
  [10_000, "swapping"],
  [18_000, "delivered"],
  [24_000, "forwarding"],
  [32_000, "wrapped"],
];
const terminal = new Set<IntentStatus>([
  "wrapped",
  "refunded",
  "expired",
  "failed",
]);

const storedSchema = z.object({
  operation: intentOperationSchema,
  idempotencyKey: z.string(),
  createdAt: z.number(),
  depositedAt: z.number().optional(),
  scenario: z.string().optional(),
});
type Stored = z.infer<typeof storedSchema>;
const stateSchema = z.object({ operations: z.array(storedSchema) });

const STORAGE_KEY = "equiteez:intents-mock:v1";

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

export function getMockScenarioFromLocation(): IntentsMockScenario | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get("intentsMock");
  return value &&
    ["refund", "expire", "busy", "sponsorship", "fail", "below"].includes(value)
    ? (value as IntentsMockScenario)
    : null;
}

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

  const quote = ({ routeId, amountIn, recipient }: IntentQuoteRequest) => {
    const route = mockIntentRoutes.find((item) => item.id === routeId);
    if (!route?.enabled)
      throw new IntentsApiError("route_disabled", "This route is unavailable.");
    if (new BigNumber(amountIn).lt(route.minAmountIn))
      throw new IntentsApiError(
        "below_minimum",
        "The amount is below the route minimum."
      );
    const amountOut = new BigNumber(amountIn)
      .shiftedBy(-route.source.token.decimals)
      .times(rates[routeId] ?? 1)
      .times(0.997)
      .shiftedBy(route.destination.decimals)
      .integerValue(BigNumber.ROUND_DOWN);
    if (getScenario() === "below" || amountOut.lte(0))
      throw new IntentsApiError(
        "below_minimum",
        "The expected output is below the minimum the bridge accepts."
      );
    return {
      route,
      quote: {
        routeId,
        amountIn,
        amountOut: amountOut.toFixed(),
        minAmountOut: amountOut
          .times(0.99)
          .integerValue(BigNumber.ROUND_DOWN)
          .toFixed(),
        recipient,
      },
    };
  };

  /** Derive the stored operation's current backend snapshot from the clock. */
  const advance = (stored: Stored): Stored => {
    const { operation } = stored;
    if (terminal.has(operation.status)) return stored;
    const at = now();
    let next: IntentOperation = operation;
    const set = (status: IntentStatus, version: number, updatedAt: number) => {
      if (version <= next.version) return;
      next = {
        ...next,
        status,
        version,
        updatedAt: new Date(updatedAt).toISOString(),
      };
    };
    if (stored.depositedAt === undefined) {
      if (at > Date.parse(operation.quoteExpiresAt))
        set("expired", 99, Date.parse(operation.quoteExpiresAt));
    } else {
      for (const [index, [offset, status]] of timeline.entries()) {
        const updatedAt = stored.depositedAt + offset;
        if (at < updatedAt) break;
        if (stored.scenario === "refund" && status === "delivered") {
          set("refunded", index, updatedAt);
          next = {
            ...next,
            refund: {
              txHash: randomHex(32),
              reason: "The swap could not be filled at the quoted rate.",
            },
          };
          break;
        }
        if (stored.scenario === "fail" && status === "wrapped") {
          set("failed", index, updatedAt);
          next = {
            ...next,
            error: {
              code: "internal",
              message: "The sponsored forward could not be submitted.",
            },
          };
          break;
        }
        set(status, index, updatedAt);
        if (status === "delivered" && !next.deliveryTxHash)
          next = { ...next, deliveryTxHash: randomHex(32) };
        if (status === "wrapped" && !next.forwardTxHash)
          next = { ...next, forwardTxHash: randomHex(32), forwardLogIndex: 0 };
      }
    }
    return next === operation ? stored : { ...stored, operation: next };
  };
  const load = (id: string) => {
    const operations = read().map(advance);
    write(operations);
    const stored = operations.find((item) => item.operation.id === id);
    if (!stored)
      throw new IntentsApiError("not_found", "Deposit operation not found.");
    return { operations, stored };
  };

  return {
    env: "mock",
    async getRoutes(options) {
      await delay(options?.signal);
      return mockIntentRoutes;
    },
    async getQuote(request, options) {
      await delay(options?.signal);
      const { quote: preview } = quote(request);
      return {
        ...preview,
        expiresAt: new Date(now() + 60_000).toISOString(),
      };
    },
    async createOperation(
      { idempotencyKey, sourceAddress, ...request },
      options
    ) {
      await delay(options?.signal);
      const operations = read().map(advance);
      const existing = operations.find(
        (item) => item.idempotencyKey === idempotencyKey
      );
      if (existing) return existing.operation;
      const scenario = getScenario();
      if (scenario === "sponsorship")
        throw new IntentsApiError(
          "sponsorship_unavailable",
          "Sponsored forwarding is temporarily unavailable."
        );
      if (
        scenario === "busy" ||
        operations.some(
          (item) =>
            item.operation.recipient === request.recipient &&
            item.depositedAt !== undefined &&
            !terminal.has(item.operation.status)
        )
      )
        throw new IntentsApiError(
          "destination_busy",
          "Another deposit to this account is still being forwarded."
        );
      const { route, quote: executable } = quote(request);
      const createdAt = now();
      const operation: IntentOperation = {
        id: `mock-${randomHex(8).slice(2)}`,
        version: 0,
        updatedAt: new Date(createdAt).toISOString(),
        sourceAddress,
        ...executable,
        quoteExpiresAt: new Date(
          createdAt + (scenario === "expire" ? 15_000 : 10 * 60_000)
        ).toISOString(),
        funding: {
          chainId: route.source.chainId,
          depositAddress,
          token: route.source.token.address,
          amount: executable.amountIn,
        },
        status: "awaiting_deposit",
      };
      write([
        ...operations,
        {
          operation,
          idempotencyKey,
          createdAt,
          scenario: scenario ?? undefined,
        },
      ]);
      return operation;
    },
    async submitDeposit(id, txHash, options) {
      await delay(options?.signal);
      const { operations, stored } = load(id);
      if (
        stored.depositedAt !== undefined ||
        stored.operation.status !== "awaiting_deposit"
      )
        return stored.operation;
      const updated: Stored = {
        ...stored,
        depositedAt: now(),
        operation: { ...stored.operation, sourceTxHash: txHash },
      };
      write(
        operations.map((item) => (item.operation.id === id ? updated : item))
      );
      return updated.operation;
    },
    async getOperation(id, options) {
      await delay(options?.signal);
      return load(id).stored.operation;
    },
  };
}
