import {
  arbitrum,
  avalanche,
  base,
  bsc,
  gnosis,
  mainnet,
  optimism,
  polygon,
} from "wagmi/chains";

/**
 * 1Click (NEAR Intents) sponsored deposits against the shared Mavryk Bridge
 * ETH backend (`near-intents/backend.md`, API v0.0.9, prefix `/v1`).
 *
 * The user pays with any source asset the backend lists in `GET
 * /v1/metadata` (twelve networks: eight EVM chains, Solana, NEAR, Aptos and
 * Bitcoin). 1Click swaps it into the default settlement token (USDT0 on
 * Arbitrum One at launch), the backend forwards it into the EVM WrapBridge
 * and the bridge mints the wrapped token (wUSDT) on Mavryk.
 *
 * It is the Deposit Funds "Send From Any Network" flow and is always on;
 * `INTENTS_API` must be set at build time. `INTENTS_API_MODE=mock` swaps the
 * HTTP client for the in-browser simulator in
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

export const INTENTS_API_MODE: "mock" | "http" =
  env("INTENTS_API_MODE") === "mock" ? "mock" : "http";
/**
 * Backend origin (e.g. `https://basenet.bridge-api.mavryk.network`), or a
 * same-origin path such as `/intents-api` that the Vite dev server proxies to
 * `INTENTS_API_PROXY_TARGET` (the Gateway CORS allowlist has no localhost).
 */
export const INTENTS_API_URL = env("INTENTS_API") ?? "";
export const INTENTS_API_PROXY_TARGET = env("INTENTS_API_PROXY_TARGET");

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
 * EVM source chains (backend.md §7). They are registered in wagmi so a
 * connected EVM wallet can read balances and send the deposit; the direct
 * USDT bridge keeps its own chain (`ETHEREUM_CHAIN`).
 */
export const INTENTS_EVM_CHAINS = [
  mainnet,
  arbitrum,
  base,
  optimism,
  polygon,
  bsc,
  avalanche,
  gnosis,
] as const;

/**
 * Network reads for non-EVM wallets (balances, Solana blockhashes). Public
 * endpoints by default; set a dedicated RPC for production traffic.
 */
export const INTENTS_SOLANA_RPC_URL =
  env("INTENTS_SOLANA_RPC_URL") ?? "https://api.mainnet-beta.solana.com";
/** Aptos fullnode REST API (balances). */
export const INTENTS_APTOS_API_URL =
  env("INTENTS_APTOS_API_URL") ?? "https://api.mainnet.aptoslabs.com/v1";
/** NEAR JSON-RPC (balances and token storage registration). */
export const INTENTS_NEAR_RPC_URL =
  env("INTENTS_NEAR_RPC_URL") ?? "https://free.rpc.fastnear.com";
/** Esplora-compatible Bitcoin API (balances). */
export const INTENTS_BITCOIN_API_URL =
  env("INTENTS_BITCOIN_API_URL") ?? "https://mempool.space/api";

/** Slippage choices (bps). The user picks one; the backend accepts 0–9999. */
export const INTENTS_SLIPPAGE_OPTIONS_BPS = [10, 50, 100, 300] as const;
export const INTENTS_DEFAULT_SLIPPAGE_BPS = 100;

/** Quote previews (backend.md §6.2, §11): debounce typing, ~10 a minute. */
export const INTENTS_PREVIEW_DEBOUNCE_MS = 700;
/** Metadata is cached about a minute and refreshed before confirmation. */
export const INTENTS_METADATA_STALE_MS = 60_000;
/** Client timeout per request (backend.md §11). */
export const INTENTS_REQUEST_TIMEOUT_MS = 15_000;

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
/**
 * A deposit can still arrive after the user left the deposit screen (sent
 * from an exchange). Such operations keep being polled until this long after
 * their funding window closed (backend.md §9: late deposits are tracked).
 */
export const INTENTS_LATE_DEPOSIT_POLL_MS = 30 * 60_000;
/** No wallet prompt is started this close to fundingExpiresAt. */
export const INTENTS_FUNDING_SAFETY_MS = 15_000;
/** Bounded wait for the source funding receipt, like the direct bridge. */
export const INTENTS_FUNDING_CONFIRMATIONS = 1;
export const INTENTS_FUNDING_TIMEOUT_MS = 10 * 60_000;
