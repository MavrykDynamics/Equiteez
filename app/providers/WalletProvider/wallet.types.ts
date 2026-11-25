/**
 * Provider-neutral wallet identity and state (docs/dynamic-wallet.md §4,
 * DYN-FE-02). Mavryk Wallet (Beacon) and Dynamic expose the same shape.
 */
import type { MavrykToolkit } from "@mavrykdynamics/taquito";

import type { DirectExecutionOptions } from "~/contracts/actions.type";
import type { AttemptTracking } from "~/services/direct/executor";
import type { WalletProviderKind } from "~/services/direct/attempt.types";
import type {
  AuthenticatorSetup,
  DynamicAuthenticator,
  DynamicPasskey,
  DynamicWalletSetup,
  SecondFactor,
} from "./dynamic/dynamicClient.client";

export type { WalletProviderKind };

export type WalletIdentity = {
  provider: WalletProviderKind;
  /** Beacon: the account address; Dynamic: the wallet-account id */
  providerWalletId: string;
  /** mv1 address */
  address: string;
  /** edpk public key */
  publicKey: string;
  /** Dynamic: the email the user signed in with */
  email?: string;
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

/**
 * Told how the wallet is being set up while a sign-in step opens it, so the
 * sign-in screens can say whether an account is created or restored
 */
export type WalletSetupListener = (setup: DynamicWalletSetup) => void;

/** Steps of the email-wallet sign-in, driven by the connect modal. */
export type DynamicConnectApi = {
  /** Loads Dynamic; connects at once if a Dynamic session is still alive */
  start: (onSetup?: WalletSetupListener) => Promise<DynamicConnectResult>;
  sendOtp: (email: string) => Promise<"sent" | "already-authenticated">;
  resendOtp: () => Promise<void>;
  /**
   * Verifies the code, then restores or creates the wallet. `onAccepted` runs
   * once Dynamic accepts the code: the code is used up from then on, and a
   * later failure is retried with start(), not with the same code.
   */
  verifyOtp: (
    code: string,
    onAccepted?: () => void,
    onSetup?: WalletSetupListener
  ) => Promise<void>;
  /** After MultipleDynamicWalletsError: connect the chosen wallet */
  selectWallet: (
    walletId: string,
    onSetup?: WalletSetupListener
  ) => Promise<void>;
  /**
   * Sends the browser to Google to sign in. The page reloads on return;
   * finishGoogleSignIn completes it there.
   */
  signInWithGoogle: () => Promise<void>;
  /** True on the page Google returned to, until finishGoogleSignIn runs */
  hasPendingGoogleSignIn: () => boolean;
  /** Completes the Google sign-in, then restores or creates the wallet */
  finishGoogleSignIn: (onSetup?: WalletSetupListener) => Promise<void>;
  /**
   * After DynamicSecondFactorRequiredError: completes the sign-in with the
   * authenticator app, a recovery code or a passkey, then opens the wallet
   */
  passSecondFactor: (
    factor: SecondFactor,
    onSetup?: WalletSetupListener
  ) => Promise<void>;
  /**
   * After DynamicWalletLockedError: unlocks the password-protected wallet in
   * this browser and connects it
   */
  unlockWallet: (
    walletId: string,
    password: string,
    onSetup?: WalletSetupListener
  ) => Promise<void>;
  /**
   * After "Confirm it's you", shows the connected wallet's private key in an
   * isolated frame Dynamic injects into `displayContainer`: the key never
   * reaches the app. Rejects with IdentityCheckCancelledError when the user
   * closes the check.
   */
  revealPrivateKey: (
    displayContainer: HTMLElement,
    /** The wallet password, when the wallet has one */
    password?: string
  ) => Promise<void>;
  /** Whether the wallet is protected by a password */
  hasWalletPassword: () => Promise<boolean>;
  /**
   * Protects the wallet with a password; rejects with
   * DynamicPasswordAlreadySetError when there already is one
   */
  setWalletPassword: (password: string) => Promise<void>;
  /** Rejects with DynamicWrongPasswordError for a wrong current password */
  changeWalletPassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
  /** The wallet has a key share backed up to Google Drive */
  isWalletBackedUp: () => boolean;
  /**
   * "stored": the Google sign-in already gave Drive access; "popup": Google's
   * consent popup has to give a token first
   */
  getGoogleDriveAccessSource: () => Promise<"stored" | "popup">;
  /** Backs the wallet up to Google Drive (a reshare of the wallet) */
  backupToGoogleDrive: (options: {
    googleDriveAccessToken?: string;
    password?: string;
  }) => Promise<void>;
  /** The turned-on authenticator app, or null */
  getAuthenticator: () => Promise<DynamicAuthenticator | null>;
  /** After "Confirm it's you": the QR code data for a new authenticator */
  startAuthenticatorSetup: () => Promise<AuthenticatorSetup>;
  /** Turns it on with its first code */
  verifyAuthenticatorSetup: (deviceId: string, code: string) => Promise<void>;
  /** One-time codes to save, for when the authenticator app is unavailable */
  getRecoveryCodes: () => Promise<string[]>;
  /** The user saved the recovery codes */
  acknowledgeRecoveryCodes: () => Promise<void>;
  /** Removes the authenticator; a current code from it is the check */
  removeAuthenticator: (deviceId: string, code: string) => Promise<void>;
  /** Passkeys on the user's Dynamic account */
  getPasskeys: () => Promise<DynamicPasskey[]>;
  /**
   * After "Confirm it's you", shows the browser's passkey prompt, then
   * registers the new passkey
   */
  addPasskey: () => Promise<void>;
  /** After "Confirm it's you" */
  removePasskey: (passkeyId: string) => Promise<void>;
};

/**
 * Why there is no wallet:
 * - signed-out: its session ended (the restore found none, the user signed
 *   out, Dynamic signed out)
 * - other-tab: another tab owns the wallet now (it signed in, switched
 *   accounts or replaced the email wallet's key)
 * - unknown: the restore could not tell (an error, or the wallet needs
 *   unlocking or a second factor)
 */
export type NoWalletReason = "signed-out" | "other-tab" | "unknown";

export type DisconnectOptions = {
  keepProviderSession?: boolean;
  keepSharedState?: boolean;
};

export type WalletContextValue = {
  phase: WalletPhase;
  /** True until a previous session has been restored or ruled out */
  isLoading: boolean;
  error: Error | null;
  identity: WalletIdentity | null;
  /** Why there is no wallet; null while there is one or it is restoring */
  noWalletReason: NoWalletReason | null;
  /** Latest identity, safe to read right after an await */
  getIdentity: () => WalletIdentity | null;
  connectMavrykWallet: () => Promise<void>;
  /**
   * keepProviderSession: switch accounts without ending the Dynamic session,
   * so signing back in needs no new code.
   * keepSharedState: another tab signed in and owns the state tabs share
   * (the saved wallet choice, Mavryk Wallet's active account): leave it.
   */
  disconnect: (options?: DisconnectOptions) => Promise<void>;
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
