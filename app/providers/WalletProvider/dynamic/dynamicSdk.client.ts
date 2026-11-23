/**
 * The only module that imports the Dynamic SDK statically. It is loaded with a
 * dynamic import() from the browser (see dynamicClient.client.ts), so the SDK
 * and its iframe never reach the server bundle or run during SSR.
 *
 * Dynamic's JavaScript SDK (@dynamic-labs-sdk/client) is a set of plain
 * functions over a client object and draws no screens of its own. This module
 * binds the functions the app uses to one client, so the rest of the code (and
 * its tests) works with a single small object. addWaasSolanaExtension enables
 * the embedded ed25519 wallet the Mavryk flow uses (Dynamic lists it under the
 * SOL chain).
 */
import {
  authenticatePasskeyMFA,
  authenticateTotpMfaDevice,
  checkStepUpAuth,
  createDynamicClient as createSdkClient,
  deletePasskey,
  getPasskeys,
  getWalletAccounts,
  initializeClient,
  logout,
  onEvent,
  registerPasskey,
  sendEmailOTP,
  signMessage,
  TokenScope,
  verifyOTP,
  type OTPVerification,
  type WalletAccount,
} from "@dynamic-labs-sdk/client";
import {
  createWaasWalletAccounts,
  exportWaasPrivateKey,
  isWaasWalletAccount,
} from "@dynamic-labs-sdk/client/waas";
import { addWaasSolanaExtension } from "@dynamic-labs-sdk/solana/waas";

// At debug level the SDK logs request details (e.g. the email), which must
// not reach users' consoles
const SDK_LOG_LEVEL = process.env.NODE_ENV === "production" ? "error" : "warn";

/**
 * Actions Dynamic guards with a fresh identity check ("step-up"): the user
 * proves who they are again and the SDK keeps the short-lived token it gets,
 * attaching it to the guarded call.
 */
const STEP_UP_SCOPES = {
  "wallet:export": TokenScope.Walletexport,
  "credential:link": TokenScope.Credentiallink,
  "credential:unlink": TokenScope.Credentialunlink,
} as const;

export type StepUpScope = keyof typeof STEP_UP_SCOPES;

export function createDynamicClient(environmentId: string) {
  const sdk = createSdkClient({
    environmentId,
    // Started below, once the wallet extension is registered
    autoInitialize: false,
    logLevel: SDK_LOG_LEVEL,
    metadata: { name: "Equiteez" },
  });

  addWaasSolanaExtension(sdk);

  const initialized = initializeClient(sdk);
  // A failed start is also published as initStatus "failed" + initError;
  // waitForInit() rejects for whoever waits on it
  initialized.catch(() => undefined);

  // The code that was emailed last: verifying and resending need it
  let pendingOtp: OTPVerification | null = null;

  return {
    get initStatus() {
      return sdk.initStatus;
    },
    get initError() {
      return sdk.initError;
    },
    get user() {
      return sdk.user;
    },
    get sessionExpiresAt() {
      return sdk.sessionExpiresAt;
    },
    waitForInit: () => initialized,

    /** Each returns its unsubscribe function */
    onUserChanged: (listener: () => void) =>
      onEvent({ event: "userChanged", listener }, sdk),
    onWalletAccountsChanged: (listener: () => void) =>
      onEvent({ event: "walletAccountsChanged", listener }, sdk),

    sendEmailOtp: async (email: string) => {
      pendingOtp = await sendEmailOTP({ email }, sdk);
    },
    resendEmailOtp: async () => {
      const email = pendingOtp?.email;

      if (!email) throw new Error("Ask for a code first.");
      pendingOtp = await sendEmailOTP({ email }, sdk);
    },
    verifyEmailOtp: async (code: string) => {
      if (!pendingOtp) throw new Error("Ask for a code first.");
      await verifyOTP(
        { otpVerification: pendingOtp, verificationToken: code },
        sdk
      );
      pendingOtp = null;
    },
    logout: async () => {
      pendingOtp = null;
      await logout(sdk);
    },

    getWalletAccounts: () => getWalletAccounts(sdk),
    isEmbeddedWallet: (walletAccount: WalletAccount) =>
      isWaasWalletAccount({ walletAccount }),
    createSolWallet: () => createWaasWalletAccounts({ chains: ["SOL"] }, sdk),
    signMessage: async (walletAccount: WalletAccount, message: string) =>
      (await signMessage({ walletAccount, message }, sdk)).signature,

    getPasskeys: () => getPasskeys(sdk),
    /** Runs the browser's passkey prompt; needs a "credential:link" check */
    registerPasskey: async () => {
      await registerPasskey({}, sdk);
    },
    /** Needs a "credential:unlink" check */
    deletePasskey: (passkeyId: string) => deletePasskey({ passkeyId }, sdk),

    /** Whether `scope` needs a fresh check, and the credentials that pass it */
    checkStepUp: (scope: StepUpScope) =>
      checkStepUpAuth({ scope: STEP_UP_SCOPES[scope] }, sdk),
    /** `purpose` makes the email describe the action instead of a sign-in */
    sendStepUpEmailCode: (email: string, scope: StepUpScope) =>
      sendEmailOTP({ email, purpose: STEP_UP_SCOPES[scope] }, sdk),
    verifyStepUpEmailCode: async (
      otpVerification: OTPVerification,
      code: string,
      scope: StepUpScope
    ) => {
      await verifyOTP(
        {
          otpVerification,
          verificationToken: code,
          requestedScopes: [STEP_UP_SCOPES[scope]],
        },
        sdk
      );
    },
    confirmWithPasskey: async (scope: StepUpScope) => {
      await authenticatePasskeyMFA(
        { requestedScopes: [STEP_UP_SCOPES[scope]] },
        sdk
      );
    },
    confirmWithAuthenticator: async (
      deviceId: string,
      code: string,
      scope: StepUpScope
    ) => {
      await authenticateTotpMfaDevice(
        { code, deviceId, requestedScopes: [STEP_UP_SCOPES[scope]] },
        sdk
      );
    },

    /**
     * Shows the wallet's private key in an isolated frame Dynamic injects into
     * `displayContainer`: the key never reaches the app. Needs a
     * "wallet:export" check first.
     */
    exportPrivateKey: (
      walletAccount: WalletAccount,
      displayContainer: HTMLElement
    ) => exportWaasPrivateKey({ walletAccount, displayContainer }, sdk),
  };
}

export type DynamicClient = ReturnType<typeof createDynamicClient>;
export type DynamicWallet = WalletAccount;
export type { OTPVerification };
