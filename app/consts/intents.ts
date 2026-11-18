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
 * Source chains the funding adapters can sign on. A catalog route on any other
 * chain is shown as unsupported. The direct USDT bridge keeps its own chain.
 */
export const INTENTS_SOURCE_CHAINS = [arbitrumSepolia, sepolia] as const;
export const INTENTS_SOURCE_RPC_URLS: Partial<Record<number, string>> = {
  [sepolia.id]: env("INTENTS_SEPOLIA_RPC_URL") || undefined,
};

/**
 * Route modes Equiteez can price without a quote preview. The Basenet
 * rehearsal settles 1:1 with zero slippage, so the accepted minimum is the
 * amount itself. Provider (1Click) routes stay unavailable until
 * `POST /v1/quotes/preview` is integrated.
 */
export const INTENTS_EXACT_PARITY_MODES: readonly string[] = ["rehearsal"];

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
/**
 * Funding-hash registration retries (backend.md §4.5/§5): a pending receipt,
 * RPC outage, 429 or lost response sends the same hash again after 10–30s,
 * backing off to the cap. There is no attempt limit.
 */
export const INTENTS_REGISTRATION_RETRY = {
  initialMs: 15_000,
  maxMs: 60_000,
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
