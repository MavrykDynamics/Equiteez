import type { IntentNetworkFamily } from "~/lib/intents/intentNetworks";

/** Networks whose wallets connect outside wagmi. */
export type IntentWalletFamily = Exclude<IntentNetworkFamily, "evm">;

/** A wallet the user can pick for a network, installed or not. */
export type IntentWalletOption = {
  id: string;
  name: string;
  /** Data URL or remote icon from the wallet itself. */
  icon?: string;
  isInstalled: boolean;
  /** Where to get it when it is not installed. */
  installUrl?: string;
};

/** A connected wallet account on one network. */
export type IntentWalletAccount = {
  walletId: string;
  walletName: string;
  /** The account's address in the network's refund-address format (§7). */
  address: string;
};

/** What to send, from the metadata asset the user confirmed. */
export type IntentWalletAsset = {
  kind: "native" | "token";
  /** Token contract, mint or account; `null` for native assets. */
  contractAddress: string | null;
  symbol: string;
  decimals: number;
};

export type IntentWalletTransfer = {
  asset: IntentWalletAsset;
  from: string;
  /** The 1Click deposit address; never the forwarder. */
  to: string;
  /** Exact source base units from the instructions. */
  amount: bigint;
};

/**
 * One network family's wallets (Solana, NEAR, Aptos, Bitcoin). Adapters are
 * loaded on demand in the browser: their SDKs never reach SSR or the initial
 * bundle.
 */
export interface IntentWalletAdapter {
  readonly family: IntentWalletFamily;
  /** Wallets detected now, plus well-known ones to install. */
  getWallets(): IntentWalletOption[];
  /** Wallets can register late (extensions inject after load). */
  onWalletsChange(listener: () => void): () => void;
  connect(walletId: string): Promise<IntentWalletAccount>;
  disconnect(walletId: string): Promise<void>;
  /** The wallet's current account, or null when it disconnected. */
  getAccount(walletId: string): Promise<string | null>;
  /** Balance of `asset` held by `owner`, in base units, read from the network. */
  getBalance(asset: IntentWalletAsset, owner: string): Promise<bigint>;
  /**
   * Asks the wallet to send the transfer; resolves with the transaction ID.
   * Throws IntentWalletError: "rejected" (declined), "not_sent" (failed
   * before broadcast) or "unknown" (may have been broadcast).
   */
  send(walletId: string, transfer: IntentWalletTransfer): Promise<string>;
}

export type IntentWalletFailure = "rejected" | "not_sent" | "unknown";

export class IntentWalletError extends Error {
  constructor(
    readonly failure: IntentWalletFailure,
    message: string
  ) {
    super(message);
    this.name = "IntentWalletError";
  }
}

const REJECTED_CODES = new Set([4001, -32000, 4100]);
const REJECTED_TEXT = /reject|denied|declin|cancel|dismiss|closed by user/i;

/**
 * Wallet errors after the wallet was asked to sign. A user rejection (EIP-1193
 * style 4001, JSON-RPC -32000, or rejection wording) allows a new request;
 * anything else may have been broadcast and is never retried automatically.
 */
export function classifyIntentWalletError(error: unknown): IntentWalletFailure {
  if (error instanceof IntentWalletError) return error.failure;
  const code = (error as { code?: unknown } | null)?.code;
  if (typeof code === "number" && REJECTED_CODES.has(code)) return "rejected";
  const message = error instanceof Error ? error.message : String(error ?? "");
  return REJECTED_TEXT.test(message) ? "rejected" : "unknown";
}

export const getIntentWalletErrorMessage = (error: unknown) =>
  error instanceof Error
    ? error.message
    : typeof error === "string"
      ? error
      : "The wallet returned an unexpected error.";
