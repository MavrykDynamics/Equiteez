import { z } from "zod";
import { arbitrumSepolia, sepolia } from "wagmi/chains";

import { USDT_BRIDGE } from "./usdtBridge";

/**
 * 1Click (NEAR Intents) sponsored deposits against the shared Mavryk Bridge
 * ETH backend (`near-intents/backend.md`, API schema 0.1.0, prefix `/v1`).
 *
 * The feature is off unless `INTENTS_DEPOSIT_ENABLED=true` is set at build time.
 * `INTENTS_API_MODE=mock` swaps the HTTP client for the in-browser simulator in
 * `~/lib/apis/intents/intents.mock.ts`; production defaults to `http`.
 */
// Vite `define`s `process.env`, as for ETHEREUM_RPC_URL in ethereum.config.ts.
const env = (name: string): string | undefined =>
  process.env[name]?.trim() || undefined;

const originOf = (value: string | undefined) => {
  try {
    return value ? new URL(value).origin : undefined;
  } catch {
    return undefined;
  }
};

export const INTENTS_DEPOSIT_ENABLED =
  env("INTENTS_DEPOSIT_ENABLED") === "true";
export const INTENTS_API_MODE: "mock" | "http" =
  env("INTENTS_API_MODE") === "mock" ? "mock" : "http";
/**
 * Backend origin (e.g. `https://basenet.bridge-api.mavryk.network`), or a
 * same-origin path such as `/intents-api` that the Vite dev server proxies to
 * `INTENTS_API_PROXY_TARGET` (the Gateway CORS allowlist has no localhost).
 */
export const INTENTS_API_URL = env("INTENTS_API") ?? "";
export const INTENTS_API_PROXY_TARGET = env("INTENTS_API_PROXY_TARGET");
/** Address the mock catalog asks the wallet to fund; testnet only. */
export const INTENTS_MOCK_DEPOSIT_ADDRESS = (env(
  "INTENTS_MOCK_DEPOSIT_ADDRESS"
) || "0x000000000000000000000000000000000000dEaD") as `0x${string}`;

/**
 * Backend environment identity. Persisted operations (with their
 * capabilities) and React Query caches are scoped to it so a different
 * backend never resumes another's state. A proxied path is identified by the
 * backend it proxies to.
 */
export const INTENTS_ENV =
  INTENTS_API_MODE === "mock"
    ? "mock"
    : (env("INTENTS_ENV") ??
      originOf(INTENTS_API_URL) ??
      originOf(INTENTS_API_PROXY_TARGET) ??
      "unconfigured");

/**
 * Bounded Basenet rehearsal (backend.md §1): the backend admits exactly one
 * pre-approved capability hash + idempotency key. When both are set, the next
 * new operation uses them instead of fresh random values. Local/test builds
 * only: never set these for a production build.
 */
export const INTENTS_REHEARSAL = (() => {
  const capability = env("INTENTS_REHEARSAL_CAPABILITY");
  const idempotencyKey = env("INTENTS_REHEARSAL_IDEMPOTENCY_KEY");
  return capability && idempotencyKey ? { capability, idempotencyKey } : null;
})();

/**
 * Source chains the funding adapters can sign on. A catalog route on any other
 * chain is shown as unsupported. The direct USDT bridge keeps its own chain.
 */
export const INTENTS_SOURCE_CHAINS = [arbitrumSepolia, sepolia] as const;
export const INTENTS_SOURCE_RPC_URLS: Partial<Record<number, string>> = {
  [sepolia.id]: env("INTENTS_SEPOLIA_RPC_URL") || undefined,
};

/**
 * Approved product configuration for a provider source asset. The route
 * catalog only carries the provider's `originAsset` identifier and decimals;
 * the token contract the wallet transfers, its ticker and the price reference
 * come from here (backend.md §4.2: "frontend asset metadata must come from
 * the approved product configuration"). A route whose `originAsset` is not
 * listed is shown as unavailable, never guessed from a ticker.
 */
const sourceAssetSchema = z.object({
  originAsset: z.string().min(1),
  chainId: z.number().int().positive(),
  token: z.union([
    z.literal("native"),
    z
      .string()
      .regex(/^0x[0-9a-fA-F]{40}$/)
      .transform((value) => value as `0x${string}`),
  ]),
  symbol: z.string().min(1),
  name: z.string().min(1),
  decimals: z.number().int().min(0).max(36),
  /**
   * How the form estimates the minimum output the user accepts before the
   * backend prepares the executable quote (there is no quote-preview
   * endpoint). `parity`: 1 source token ≈ 1 settlement token (stablecoins).
   * `reference`: settlement tokens per source token; testnet/mock only.
   */
  pricing: z.discriminatedUnion("kind", [
    z.object({ kind: z.literal("parity") }),
    z.object({
      kind: z.literal("reference"),
      rate: z.string().regex(/^\d+(\.\d+)?$/),
    }),
  ]),
  /**
   * Headroom for provider/route fees, applied before slippage. A quote's
   * minimum is its fee-adjusted output minus slippage, so an estimate
   * without fee headroom would be rejected (QUOTE_REJECTED) every time.
   */
  feeAllowanceBps: z.number().int().min(0).max(5000),
});
export type IntentSourceAsset = z.infer<typeof sourceAssetSchema>;

/** Source assets of the in-browser simulator (`INTENTS_API_MODE=mock`). */
export const MOCK_INTENT_SOURCE_ASSETS: IntentSourceAsset[] = [
  {
    originAsset: "mock:arb-sepolia:usdt",
    chainId: arbitrumSepolia.id,
    token: USDT_BRIDGE.sourceToken.address,
    symbol: "USDT",
    name: "Mock USDT",
    decimals: USDT_BRIDGE.sourceToken.decimals,
    pricing: { kind: "parity" },
    feeAllowanceBps: 50,
  },
  {
    originAsset: "mock:sepolia:eth",
    chainId: sepolia.id,
    token: "native",
    symbol: "ETH",
    name: "Ether",
    decimals: 18,
    pricing: { kind: "reference", rate: "3000" },
    feeAllowanceBps: 100,
  },
];

function readSourceAssets(): IntentSourceAsset[] {
  const raw = env("INTENTS_SOURCE_ASSETS");
  if (!raw) return INTENTS_API_MODE === "mock" ? MOCK_INTENT_SOURCE_ASSETS : [];
  try {
    return z.array(sourceAssetSchema).parse(JSON.parse(raw));
  } catch {
    console.warn(
      "INTENTS_SOURCE_ASSETS is not valid; no 1Click route is enabled."
    );
    return [];
  }
}

/**
 * `INTENTS_SOURCE_ASSETS` (JSON array of IntentSourceAsset) overrides the
 * defaults, e.g. for the Basenet rehearsal route once its `originAsset` is
 * known. HTTP mode has no default: every route stays disabled until its
 * source asset is approved here.
 */
export const INTENTS_SOURCE_ASSETS = readSourceAssets();

/**
 * Settlement-chain ERC-20 → Mavryk FA2 pairs of the existing bridge
 * (`near-intents/updated-bridge-contracts.md`). A route must settle through
 * one of them; the destination token, its decimals and the receipt check all
 * come from here, not from the route catalog.
 */
export const INTENTS_BRIDGE_PAIRS = [
  {
    settlementChainId: String(USDT_BRIDGE.chainId),
    bridgeAddress: USDT_BRIDGE.address,
    settlementToken: USDT_BRIDGE.sourceToken.address,
    settlementDecimals: USDT_BRIDGE.sourceToken.decimals,
    destination: USDT_BRIDGE.destinationToken,
  },
] as const;
export type IntentBridgePair = (typeof INTENTS_BRIDGE_PAIRS)[number];

/** Slippage choices (bps), limited further by each route's maxSlippageBps. */
export const INTENTS_SLIPPAGE_OPTIONS_BPS = [10, 50, 100] as const;
export const INTENTS_DEFAULT_SLIPPAGE_BPS = 50;

export const INTENTS_POLL_INTERVALS = {
  /** Used when an operation has no retryAfterMs. */
  defaultMs: 5_000,
  /** retryAfterMs is clamped to this range, then jittered by ±10%. */
  minMs: 1_500,
  maxMs: 60_000,
  /** Network/5xx backoff starts here and doubles up to maxMs. */
  errorInitialMs: 5_000,
} as const;
/** Consecutive 404s before an operation is treated as no longer readable. */
export const INTENTS_NOT_FOUND_LIMIT = 3;
/**
 * WRAPPED with settlement NOT_TRACKED: keep polling this long after the last
 * backend update in case settlement observation starts, then stop.
 */
export const INTENTS_UNTRACKED_SETTLEMENT_POLL_MS = 2 * 60 * 60_000;
/** No wallet prompt is started this close to fundingExpiresAt. */
export const INTENTS_FUNDING_SAFETY_MS = 15_000;
/** Bounded wait for the source funding receipt, like the direct bridge. */
export const INTENTS_FUNDING_CONFIRMATIONS = 1;
export const INTENTS_FUNDING_TIMEOUT_MS = 10 * 60_000;
