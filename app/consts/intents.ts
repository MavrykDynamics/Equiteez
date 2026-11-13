import { arbitrumSepolia, sepolia } from "wagmi/chains";

/**
 * 1Click (NEAR Intents) sponsored deposits.
 *
 * The feature is off unless `INTENTS_DEPOSIT_ENABLED=true` is set at build time.
 * `INTENTS_API_MODE=mock` swaps the HTTP client for the in-browser simulator in
 * `~/lib/apis/intents/intents.mock.ts`; production defaults to `http`.
 */
// Vite `define`s `process.env`, as for ETHEREUM_RPC_URL in ethereum.config.ts.
const env = (name: string): string | undefined => process.env[name]?.trim();

export const INTENTS_DEPOSIT_ENABLED =
  env("INTENTS_DEPOSIT_ENABLED") === "true";
export const INTENTS_API_MODE: "mock" | "http" =
  env("INTENTS_API_MODE") === "mock" ? "mock" : "http";
export const INTENTS_API_URL = env("INTENTS_API") ?? "";
/** Address the mock catalog asks the wallet to fund; testnet only. */
export const INTENTS_MOCK_DEPOSIT_ADDRESS = (env(
  "INTENTS_MOCK_DEPOSIT_ADDRESS"
) || "0x000000000000000000000000000000000000dEaD") as `0x${string}`;

/**
 * Backend environment identity. Persisted operations, quotes and React Query
 * caches are scoped to it so a different backend never resumes another's state.
 */
export const INTENTS_ENV =
  INTENTS_API_MODE === "mock"
    ? "mock"
    : (() => {
        try {
          return new URL(INTENTS_API_URL).origin;
        } catch {
          return "unconfigured";
        }
      })();

/**
 * Source chains the funding adapters can sign on. A catalog route on any other
 * chain is shown as unsupported. The direct USDT bridge keeps its own chain.
 */
export const INTENTS_SOURCE_CHAINS = [arbitrumSepolia, sepolia] as const;
export const INTENTS_SOURCE_RPC_URLS: Partial<Record<number, string>> = {
  [sepolia.id]: env("INTENTS_SEPOLIA_RPC_URL") || undefined,
};

/** Destination the 1Click route must resolve to on Mavryk. */
export const INTENTS_DESTINATION_NETWORK = "basenet";

export const INTENTS_POLL_INTERVALS = {
  initialMs: 5_000,
  maxMs: 30_000,
} as const;
/** Bounded wait for the source funding receipt, like the direct bridge. */
export const INTENTS_FUNDING_CONFIRMATIONS = 1;
export const INTENTS_FUNDING_TIMEOUT_MS = 10 * 60_000;
export const INTENTS_HINT_RETRY_MS = [2_000, 5_000, 15_000, 30_000] as const;
