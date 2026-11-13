/**
 * Provider-neutral wallet identity and state (docs/dynamic-wallet.md §4,
 * DYN-FE-02). Mavryk Wallet (Beacon) and Dynamic expose the same shape.
 */
import type { MavrykToolkit } from "@mavrykdynamics/taquito";

import type { DirectExecutionOptions } from "~/contracts/actions.type";
import type { AttemptTracking } from "~/services/direct/executor";
import type { WalletProviderKind } from "~/services/direct/attempt.types";

export type { WalletProviderKind };

export type WalletIdentity = {
  provider: WalletProviderKind;
  /** Beacon: the account address; Dynamic: the wallet-account id */
  providerWalletId: string;
  /** mv1 address */
  address: string;
  /** edpk public key */
  publicKey: string;
  /** Network of the app's RPC node, which the toolkit signs for */
  chainId: string;
  /**
   * Network the extension itself is set to (Beacon only). Dynamic signs
   * through the app's toolkit, which checks chainId.
   */
  walletNetwork?: string;
  environment: string;
  /** Changes on every connect, disconnect or account switch */
  epoch: number;
};

export type WalletPhase =
  /** Restoring a previous session on page load */
  | "restoring"
  | "disconnected"
  /** Signing in or setting up the wallet */
  | "connecting"
  | "wallet-ready"
  | "error";

export type AuthPayloadSignature = {
  publicKey: string;
  signature: string;
  walletProvider: WalletProviderKind;
};

export type DynamicConnectResult = "connected" | "needs-email";

/** Steps of the email-wallet sign-in, driven by the connect modal. */
export type DynamicConnectApi = {
  /** Loads Dynamic; connects at once if a Dynamic session is still alive */
  start: () => Promise<DynamicConnectResult>;
  sendOtp: (email: string) => Promise<"sent" | "already-authenticated">;
  resendOtp: () => Promise<void>;
  /**
   * Verifies the code, then restores or creates the wallet. `onAccepted` runs
   * once Dynamic accepts the code: the code is used up from then on, and a
   * later failure is retried with start(), not with the same code.
   */
  verifyOtp: (code: string, onAccepted?: () => void) => Promise<void>;
  /** After MultipleDynamicWalletsError: connect the chosen wallet */
  selectWallet: (walletId: string) => Promise<void>;
};

export type WalletContextValue = {
  phase: WalletPhase;
  /** True until a previous session has been restored or ruled out */
  isLoading: boolean;
  error: Error | null;
  identity: WalletIdentity | null;
  /** Latest identity, safe to read right after an await */
  getIdentity: () => WalletIdentity | null;
  connectMavrykWallet: () => Promise<void>;
  /**
   * keepProviderSession: switch accounts without ending the Dynamic session,
   * so signing back in needs no new code
   */
  disconnect: (options?: { keepProviderSession?: boolean }) => Promise<void>;
  /** Toolkit that signs with the connected wallet; null when disconnected */
  getToolkit: () => MavrykToolkit | null;
  signAuthPayload: (packedHex: string) => Promise<AuthPayloadSignature>;
  /** Present when email wallets are enabled for this environment */
  dynamic: DynamicConnectApi | null;
  /** Attempt tracking and MVRK checks for contract actions */
  directExecution?: {
    options: DirectExecutionOptions;
    tracking: AttemptTracking | null;
  };
};
