import { BigNumber } from "bignumber.js";
import { v4 as uuid } from "uuid";
import { z } from "zod";

import { USDT_BRIDGE } from "~/consts/usdtBridge";
import {
  isIdempotencyKey,
  isOperationCapability,
} from "~/lib/intents/intentCapability";
import {
  getIntentNetwork,
  getRefundAddressError,
  normalizeRefundAddress,
} from "~/lib/intents/intentNetworks";
import {
  intentOperationRequestSchema,
  intentOperationSchema,
  intentPreviewRequestSchema,
} from "./intents.schema";
import {
  IntentsApiError,
  type IntentErrorCode,
  type IntentMetadata,
  type IntentOperation,
  type IntentPreview,
  type IntentPreviewRequest,
  type IntentsApi,
  type IntentSourceAsset,
} from "./intents.types";

/**
 * In-browser simulator of the Mavryk Bridge ETH backend (v0.0.9) for building
 * and testing the UI without the shared environment. Never enabled in
 * production builds (INTENTS_API_MODE=mock). Wallet transfers are disabled in
 * mock mode: "Simulate Deposit" stands in for the user's payment.
 *
 * Force a branch with `?intentsMock=<scenario>`:
 * - `reject`          quote rejected (closure QUOTE_REJECTED)
 * - `expire`          instructions expire 20s after publication
 * - `paused`          funding PAUSED / attention SETTLEMENT_TOKEN_PAUSED
 * - `memo`            instructions carry a deposit memo
 * - `unavailable`     POST /operations fails with 503 DEPENDENCY_UNAVAILABLE
 * - `previewBusy`     previews fail with 429 PREVIEW_BUSY
 * - `refund`          provider reports a refund after the deposit
 * - `incomplete`      attention DEPOSIT_INCOMPLETE after the deposit
 * - `review`          attention MANUAL_REVIEW after delivery
 * - `untracked`       WRAPPED with settlement NOT_TRACKED
 * - `stale`           metadata catalog stale, no assets
 * - `admissionPaused` metadata admissionPaused
 * - `noToken`         metadata without a default settlement token
 */
export const intentsMockScenarios = [
  "reject",
  "expire",
  "paused",
  "memo",
  "unavailable",
  "previewBusy",
  "refund",
  "incomplete",
  "review",
  "untracked",
  "stale",
  "admissionPaused",
  "noToken",
] as const;
export type IntentsMockScenario = (typeof intentsMockScenarios)[number];

const SETTLEMENT_DECIMALS = 6;
const DESTINATION = USDT_BRIDGE.destinationToken;
const MAVRYK_CHAIN_ID = "NetXbasenetMock";

const asset = (
  value: Omit<IntentSourceAsset, "depositMode"> &
    Partial<Pick<IntentSourceAsset, "depositMode">>
): IntentSourceAsset => ({ depositMode: "SIMPLE", ...value });

/** Mainnet-shaped catalog; the unknown "tron" entry must stay hidden. */
export const mockIntentSourceAssets: IntentSourceAsset[] = [
  asset({
    assetId: "nep141:sol.omft.near",
    network: "sol",
    family: "solana",
    evmChainId: null,
    kind: "native",
    contractAddress: null,
    symbol: "SOL",
    decimals: 9,
    coingeckoId: "solana",
  }),
  asset({
    assetId: "nep141:btc.omft.near",
    network: "btc",
    family: "bitcoin",
    evmChainId: null,
    kind: "native",
    contractAddress: null,
    symbol: "BTC",
    decimals: 8,
    coingeckoId: "bitcoin",
  }),
  asset({
    assetId: "nep141:eth.omft.near",
    network: "eth",
    family: "evm",
    evmChainId: "1",
    kind: "native",
    contractAddress: null,
    symbol: "ETH",
    decimals: 18,
    coingeckoId: "ethereum",
  }),
  asset({
    assetId: "nep141:base-0x833589fcd6edb6e08f4c7c32d4f71b54bda02913.omft.near",
    network: "base",
    family: "evm",
    evmChainId: "8453",
    kind: "token",
    contractAddress: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
    symbol: "USDC",
    decimals: 6,
    coingeckoId: "usd-coin",
  }),
  asset({
    assetId: "nep141:arb-0xaf88d065e77c8cc2239327c5edb3a432268e5831.omft.near",
    network: "arb",
    family: "evm",
    evmChainId: "42161",
    kind: "token",
    contractAddress: "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
    symbol: "USDC",
    decimals: 6,
    coingeckoId: "usd-coin",
  }),
  asset({
    assetId: "nep141:wrap.near",
    network: "near",
    family: "near",
    evmChainId: null,
    kind: "native",
    contractAddress: null,
    symbol: "NEAR",
    decimals: 24,
    coingeckoId: "near",
  }),
  asset({
    assetId: "nep141:zec.omft.near",
    network: "near",
    family: "near",
    evmChainId: null,
    kind: "token",
    contractAddress: "zec.omft.near",
    symbol: "ZEC",
    decimals: 8,
    coingeckoId: "zcash",
  }),
  asset({
    assetId: "nep141:aptos.omft.near",
    network: "aptos",
    family: "aptos",
    evmChainId: null,
    kind: "native",
    contractAddress: null,
    symbol: "APT",
    decimals: 8,
    coingeckoId: "aptos",
  }),
  asset({
    assetId: "nep141:tron.omft.near",
    network: "tron",
    family: "evm",
    evmChainId: null,
    kind: "native",
    contractAddress: null,
    symbol: "TRX",
    decimals: 6,
    coingeckoId: "tron",
  }),
];

export const mockSettlementToken = {
  settlementTokenId: "usdt0-arbitrum",
  settlementTokenVersion: 1,
  isDefault: true,
  previewSupported: true,
  settlementAsset: {
    assetId: "nep141:arb-0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9.omft.near",
    chainId: "42161",
    contractAddress: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
    symbol: "USDT0",
    decimals: SETTLEMENT_DECIMALS,
  },
  destinationAsset: {
    chainId: MAVRYK_CHAIN_ID,
    kind: "fa2" as const,
    contractAddress: DESTINATION.address,
    tokenId: DESTINATION.id,
    decimals: DESTINATION.decimals,
  },
};

/** `GET /v1/metadata` without scenarios. */
export const mockIntentMetadata: IntentMetadata = {
  admissionPaused: false,
  catalog: { fetchedAt: "2026-11-25T10:00:00.000Z", stale: false },
  defaultSettlementToken: {
    settlementTokenId: mockSettlementToken.settlementTokenId,
    settlementTokenVersion: mockSettlementToken.settlementTokenVersion,
  },
  settlementTokens: [mockSettlementToken],
  sourceAssets: mockIntentSourceAssets,
};

/** USD per whole source token (USDT0 ≈ $1). */
const prices: Record<string, number> = {
  SOL: 214.3,
  BTC: 95_000,
  ETH: 3_000,
  USDC: 1,
  NEAR: 3,
  ZEC: 45,
  APT: 8,
};
/** 1Click fee, settlement units, already included in amountOut. */
const WITHDRAW_FEE = "4000";
const MIN_OUT = new BigNumber(1).shiftedBy(SETTLEMENT_DECIMALS);
const MAX_OUT = new BigNumber(1_000_000).shiftedBy(SETTLEMENT_DECIMALS);

/** Sample deposit addresses per family (never real 1Click addresses). */
const depositAddresses: Record<string, () => string> = {
  evm: () => randomHex(20),
  solana: () => "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin",
  near: () => randomHex(32).slice(2),
  aptos: () => randomHex(32),
  bitcoin: () => "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
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
  scenario: z.string().optional(),
});
type Stored = z.infer<typeof storedSchema>;
const stateSchema = z.object({ operations: z.array(storedSchema) });

const STORAGE_KEY = "equiteez:intents-mock:v3";

type MockOptions = {
  storage?: () => Pick<Storage, "getItem" | "setItem">;
  now?: () => number;
  latencyMs?: number;
  getScenario?: () => IntentsMockScenario | null;
};

/** The simulator's extra test hook; not part of the backend contract. */
type IntentsMockApi = IntentsApi & {
  simulateDeposit(capability: string, operationId: string): void;
};

const randomHex = (bytes: number) =>
  `0x${Array.from({ length: bytes }, () =>
    Math.floor(Math.random() * 256)
      .toString(16)
      .padStart(2, "0")
  ).join("")}` as `0x${string}`;

const fail = (
  code: IntentErrorCode,
  status: number,
  message: string,
  retryAfterMs?: number
) => new IntentsApiError(code, message, status, uuid(), retryAfterMs);

export function getMockScenarioFromLocation(): IntentsMockScenario | null {
  if (typeof window === "undefined") return null;
  const value = new URLSearchParams(window.location.search).get("intentsMock");
  return (intentsMockScenarios as readonly string[]).includes(value ?? "")
    ? (value as IntentsMockScenario)
    : null;
}

const iso = (at: number) => new Date(at).toISOString();

/** Simulated deposit for the mock API; a no-op for any other client. */
export function simulateMockDeposit(
  api: IntentsApi,
  capability: string,
  operationId: string
) {
  (api as Partial<IntentsMockApi>).simulateDeposit?.(capability, operationId);
}

/** Indicative price shared by previews and executable quotes. */
function price(request: IntentPreviewRequest, at: number): IntentPreview {
  const source = mockIntentSourceAssets.find(
    (item) => item.assetId === request.sourceAssetId
  )!;
  const amountOut = new BigNumber(request.amountIn)
    .shiftedBy(-source.decimals)
    .times(prices[source.symbol] ?? 1)
    .times(0.997)
    .shiftedBy(SETTLEMENT_DECIMALS)
    .integerValue(BigNumber.ROUND_DOWN)
    .minus(WITHDRAW_FEE);
  const out = BigNumber.max(amountOut, 0);
  const minimum = out
    .times(10_000 - request.slippageBps)
    .div(10_000)
    .integerValue(BigNumber.ROUND_DOWN);
  // Destination FA2 and USDT0 both use six decimals: nothing is rounded.
  return {
    kind: "indicative",
    executable: false,
    sourceAssetId: request.sourceAssetId,
    settlementTokenId: request.settlementTokenId,
    settlementTokenVersion: request.settlementTokenVersion,
    slippageBps: request.slippageBps,
    amountIn: request.amountIn,
    amountOut: out.toFixed(),
    minAmountOut: minimum.toFixed(),
    bridgeableAmountOut: out.toFixed(),
    bridgeableMinAmountOut: minimum.toFixed(),
    destinationAmountOut: out.toFixed(),
    destinationMinAmountOut: minimum.toFixed(),
    destinationAsset: mockSettlementToken.destinationAsset,
    providerTimestamp: iso(at),
    quotedAt: iso(at),
    expiresAt: iso(at + 30_000),
    providerTimeEstimateSeconds: source.network === "btc" ? 600 : 35,
    refundFee: new BigNumber(10)
      .pow(Math.max(0, source.decimals - 4))
      .toFixed(),
    withdrawFee: WITHDRAW_FEE,
  };
}

export function createIntentsMockApi({
  storage = () => window.sessionStorage,
  now = Date.now,
  latencyMs = 300,
  getScenario = getMockScenarioFromLocation,
}: MockOptions = {}): IntentsMockApi {
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

  const metadata = (): IntentMetadata => {
    const scenario = getScenario();
    if (scenario === "stale")
      return {
        ...mockIntentMetadata,
        catalog: { fetchedAt: null, stale: true },
        sourceAssets: [],
      };
    if (scenario === "admissionPaused")
      return { ...mockIntentMetadata, admissionPaused: true };
    if (scenario === "noToken")
      return { ...mockIntentMetadata, defaultSettlementToken: null };
    return mockIntentMetadata;
  };

  /** Validation shared by preview and creation (backend.md §6.2, §7, §10). */
  const validate = (request: IntentPreviewRequest) => {
    const current = metadata();
    if (current.catalog.stale)
      throw fail("CATALOG_STALE", 503, "The asset catalog is stale.");
    if (current.admissionPaused)
      throw fail("DEPENDENCY_UNAVAILABLE", 503, "Admission is paused.");
    const token = current.defaultSettlementToken;
    if (
      !token ||
      token.settlementTokenId !== request.settlementTokenId ||
      token.settlementTokenVersion !== request.settlementTokenVersion
    )
      throw fail(
        "SETTLEMENT_TOKEN_UNAVAILABLE",
        409,
        "The settlement token is unavailable."
      );
    const source = current.sourceAssets.find(
      (item) => item.assetId === request.sourceAssetId
    );
    const network = getIntentNetwork(source?.network);
    if (!source || !network)
      throw fail(
        "SOURCE_ASSET_UNAVAILABLE",
        409,
        "The source asset is unavailable."
      );
    if (getRefundAddressError(network, request.refundAddress))
      throw fail(
        "VALIDATION_ERROR",
        400,
        "refundAddress is invalid for the source network."
      );
    const preview = price(request, now());
    if (new BigNumber(preview.amountOut).gt(MAX_OUT))
      throw fail("AMOUNT_TOO_HIGH", 409, "1Click does not quote this amount.");
    if (new BigNumber(preview.amountOut).lt(MIN_OUT))
      throw fail("AMOUNT_TOO_LOW", 409, "1Click does not quote this amount.");
    return { preview, network };
  };

  /** Applies every clock-driven transition that is due, once, persistently. */
  const advance = (stored: Stored): Stored => {
    const at = now();
    let op = stored.operation;
    let { stage } = stored;
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
        const quote = price(op, quotedAt);
        const source = mockIntentSourceAssets.find(
          (item) => item.assetId === op.sourceAssetId
        );
        const network = getIntentNetwork(source?.network);
        if (
          stored.scenario === "reject" ||
          !network ||
          new BigNumber(quote.bridgeableMinAmountOut).lt(
            op.acceptedMinAmountOut
          )
        )
          bump({ closure: "QUOTE_REJECTED", retryAfterMs: 5_000 }, quotedAt);
        else {
          const isBitcoin = network.family === "bitcoin";
          // Bitcoin: funding closes ~1h before a deadline up to 3h away.
          const fundingExpiresAt =
            quotedAt +
            (stored.scenario === "expire"
              ? 20_000
              : isBitcoin
                ? 2 * 60 * 60_000
                : 10 * 60_000);
          const deadline =
            fundingExpiresAt + (isBitcoin ? 60 * 60_000 : 60_000);
          const paused = stored.scenario === "paused";
          bump(
            {
              phase: "AWAITING_DEPOSIT",
              fundingStatus: paused ? "PAUSED" : "AVAILABLE",
              attention: paused ? "SETTLEMENT_TOKEN_PAUSED" : "NONE",
              providerStatus: "PENDING_DEPOSIT",
              retryAfterMs: 5_000,
              fundingInstructions: paused
                ? null
                : {
                    quoteId: uuid(),
                    sourceNetwork: network.key,
                    originAsset: op.sourceAssetId,
                    depositAddress: depositAddresses[network.family](),
                    depositMemo:
                      stored.scenario === "memo" ? "1029384756" : null,
                    amount: op.amountIn,
                    amountOut: quote.amountOut,
                    minAmountOut: quote.minAmountOut,
                    bridgeableAmountOut: quote.bridgeableAmountOut,
                    bridgeableMinAmountOut: quote.bridgeableMinAmountOut,
                    deadline: iso(deadline),
                    fundingExpiresAt: iso(fundingExpiresAt),
                    forwarderAddress: randomHex(20),
                  },
              nextCheckAt: iso(quotedAt + 5_000),
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
                  attention: "REFUND_PENDING",
                  refund: {
                    status: "REPORTED",
                    amount: op.amountIn,
                    asset: op.sourceAssetId,
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
          bump(
            {
              settlement: {
                status: "CONFIRMED",
                confirmedAmount: amountOut,
                tokenAddress: DESTINATION.address,
                tokenId: DESTINATION.id,
                mavrykChainId: MAVRYK_CHAIN_ID,
                mints: [
                  {
                    wrapTransactionHash: event.transactionHash,
                    wrapLogIndex: event.logIndex,
                    operationHash: `oo${randomHex(24).slice(2)}`,
                    blockHash: `BL${randomHex(24).slice(2)}`,
                    level: 1_000_000,
                    amount: amountOut,
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
    // Unknown and foreign operations look the same (backend.md §5).
    if (!stored) throw fail("NOT_FOUND", 404, "Operation not found.");
    return { operations, stored };
  };

  return {
    env: "mock",
    async getMetadata(options) {
      await delay(options?.signal);
      return metadata();
    },
    async previewQuote(input, options) {
      await delay(options?.signal);
      const parsed = intentPreviewRequestSchema.strict().safeParse(input);
      if (!parsed.success)
        throw fail("VALIDATION_ERROR", 400, "Invalid request body.");
      if (getScenario() === "previewBusy")
        throw fail("PREVIEW_BUSY", 429, "Preview capacity is busy.", 60_000);
      if (!metadata().settlementTokens.every((token) => token.previewSupported))
        throw fail("QUOTE_PREVIEW_DISABLED", 503, "Previews are disabled.");
      return validate(parsed.data).preview;
    },
    async createOperation({ capability, idempotencyKey }, input, options) {
      await delay(options?.signal);
      if (!isOperationCapability(capability))
        throw fail("NOT_FOUND", 404, "Operation not found.");
      if (!isIdempotencyKey(idempotencyKey))
        throw fail("VALIDATION_ERROR", 400, "Invalid Idempotency-Key.");
      const parsed = intentOperationRequestSchema.strict().safeParse(input);
      if (!parsed.success)
        throw fail("VALIDATION_ERROR", 400, "Invalid request body.");
      const operations = load();
      const existing = operations.find(
        (item) =>
          item.capability === capability &&
          item.idempotencyKey === idempotencyKey
      );
      const body = JSON.stringify(parsed.data);
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
      const { network } = validate(parsed.data);
      const createdAt = now();
      const operation: IntentOperation = {
        ...parsed.data,
        // An EVM refund address is returned lower-cased (backend.md §6.3).
        refundAddress: normalizeRefundAddress(
          network,
          parsed.data.refundAddress
        ),
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
        retryAfterMs: 5_000,
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
    simulateDeposit(capability, id) {
      const { operations, stored } = find(capability, id);
      if (
        stored.depositedAt !== undefined ||
        stored.operation.fundingStatus !== "AVAILABLE"
      )
        return;
      write(
        operations.map((item) =>
          item === stored
            ? advance({
                ...item,
                depositedAt: now(),
                quotedAmountOut:
                  item.operation.fundingInstructions?.bridgeableAmountOut,
              })
            : item
        )
      );
    },
  };
}
