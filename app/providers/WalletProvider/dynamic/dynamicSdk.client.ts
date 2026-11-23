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
  acknowledgeRecoveryCodes,
  authenticateMfaRecoveryCode,
  authenticatePasskeyMFA,
  authenticateTotpMfaDevice,
  checkStepUpAuth,
  clearSocialRedirectParams,
  completeSocialRedirect,
  createDynamicClient as createSdkClient,
  deleteMfaDevice,
  deletePasskey,
  detectSocialRedirectUrl,
  getGoogleDriveBackupReadiness,
  getMfaDevices,
  getMfaMethods,
  getMfaRecoveryCodes,
  getPasskeys,
  getUserSocialAccounts,
  getWalletAccounts,
  initializeClient,
  isInsufficientGoogleDriveScopesError,
  isUserMissingMfaAuth,
  logout,
  MfaInvalidOtpError,
  onEvent,
  refreshUser,
  registerPasskey,
  registerTotpMfaDevice,
  sendEmailOTP,
  signInWithSocialRedirect,
  signMessage,
  TokenScope,
  verifyOTP,
  type OTPVerification,
  type WalletAccount,
} from "@dynamic-labs-sdk/client";
import {
  backupWaasKeySharesToGoogleDrive,
  createWaasWalletAccounts,
  exportWaasPrivateKey,
  getChainsMissingWaasWalletAccounts,
  getWalletRecoveryState,
  isWaasWalletAccount,
  setWaasWalletAccountPassword,
  unlockWallet,
  updateWaasPassword,
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

    /** Sends the browser to Google; it comes back to `redirectUrl` */
    signInWithGoogle: (redirectUrl: string) =>
      signInWithSocialRedirect({ provider: "google", redirectUrl }, sdk),
    /**
     * Finishes the return from Google at `url`. False when the URL is not a
     * return this browser started (an old link, another tab). Removes the
     * one-time parameters from the address bar either way.
     */
    completeGoogleRedirect: async (url: URL) => {
      try {
        if (!(await detectSocialRedirectUrl({ url }, sdk))) return false;
        await completeSocialRedirect({ url }, sdk);
        return true;
      } finally {
        clearSocialRedirectParams();
      }
    },

    getWalletAccounts: () => getWalletAccounts(sdk),
    isEmbeddedWallet: (walletAccount: WalletAccount) =>
      isWaasWalletAccount({ walletAccount }),
    createSolWallet: () => createWaasWalletAccounts({ chains: ["SOL"] }, sdk),
    /**
     * True when the user's account already has an embedded SOL wallet, read
     * from the account's credentials. The wallet list can lag behind them
     * (it is built once the wallet provider can read the credential), so this
     * is what decides whether a wallet may be created.
     */
    hasSolWalletOnAccount: () =>
      !getChainsMissingWaasWalletAccounts(sdk).includes("SOL"),
    signMessage: async (walletAccount: WalletAccount, message: string) =>
      (await signMessage({ walletAccount, message }, sdk)).signature,
    /**
     * True when the wallet is protected by a password and not unlocked in
     * this browser yet: it cannot sign until unlockWallet
     */
    isWalletLocked: async (walletAccount: WalletAccount) =>
      (await getWalletRecoveryState({ walletAccount }, sdk))
        .walletReadyState === "encrypted",
    unlockWallet: async (walletAccount: WalletAccount, password: string) => {
      await unlockWallet({ walletAccount, password }, sdk);
    },
    /**
     * Whether the user's wallets are protected by a password. The password is
     * per user: one wallet (e.g. the EVM one Dynamic creates alongside) can
     * report it while another does not yet, so every embedded wallet is asked.
     */
    hasWalletPassword: async () => {
      const states = await Promise.allSettled(
        getWalletAccounts(sdk)
          .filter((walletAccount) => isWaasWalletAccount({ walletAccount }))
          .map((walletAccount) =>
            getWalletRecoveryState({ walletAccount }, sdk)
          )
      );
      const answered = states.filter((state) => state.status === "fulfilled");

      if (!answered.length && states.length) {
        throw (states[0] as PromiseRejectedResult).reason;
      }

      return answered.some((state) => state.value.isPasswordEncrypted);
    },
    /** The user signed in with (or linked) a Google account */
    hasGoogleAccount: () =>
      getUserSocialAccounts(sdk).some(
        (account) => `${account.provider}` === "google"
      ),
    /**
     * Whether Dynamic's stored Google token already has the Drive scopes, so
     * a backup can run without asking Google again
     */
    isGoogleDriveReady: async () =>
      (await getGoogleDriveBackupReadiness(sdk)).status === "ready",
    /**
     * Reshares the wallet and uploads the extra key share to the user's
     * Drive. Without `googleDriveAccessToken` the stored Google token is used.
     */
    backupToGoogleDrive: (
      walletAccount: WalletAccount,
      {
        googleDriveAccessToken,
        password,
      }: { googleDriveAccessToken?: string; password?: string }
    ) =>
      backupWaasKeySharesToGoogleDrive(
        {
          walletAccount,
          ...(googleDriveAccessToken ? { googleDriveAccessToken } : {}),
          ...(password ? { password } : {}),
        },
        sdk
      ),
    isGoogleDriveAccessError: (error: unknown) =>
      isInsufficientGoogleDriveScopesError(error),
    /** Re-reads the user, e.g. its wallets' backups after a backup */
    refreshUser: async () => {
      await refreshUser(sdk);
    },

    /** Protects all of the user's wallets with a new password */
    setWalletPassword: (walletAccount: WalletAccount, password: string) =>
      setWaasWalletAccountPassword({ walletAccount, password }, sdk),
    changeWalletPassword: (
      walletAccount: WalletAccount,
      currentPassword: string,
      newPassword: string
    ) =>
      updateWaasPassword({ walletAccount, currentPassword, newPassword }, sdk),

    getPasskeys: () => getPasskeys(sdk),
    /** Runs the browser's passkey prompt; needs a "credential:link" check */
    registerPasskey: async () => {
      await registerPasskey({}, sdk);
    },
    /** Needs a "credential:unlink" check */
    deletePasskey: (passkeyId: string) => deletePasskey({ passkeyId }, sdk),

    /** Authenticator app (TOTP) devices on the user's account */
    getAuthenticators: async () =>
      (await getMfaDevices(sdk)).filter(
        (device) => `${device.type}` === "totp" && Boolean(device.id)
      ),
    /**
     * Starts adding an authenticator app: the otpauth:// URI for the QR code
     * and the key to type in. Needs a "credential:link" check.
     */
    registerAuthenticator: () => registerTotpMfaDevice(sdk),
    /** The first code from the app turns the new authenticator on */
    verifyAuthenticator: async (deviceId: string, code: string) => {
      await authenticateTotpMfaDevice({ code, deviceId }, sdk);
    },
    /** One-time codes for when the authenticator app is unavailable */
    getRecoveryCodes: async () =>
      (await getMfaRecoveryCodes(sdk)).recoveryCodes,
    acknowledgeRecoveryCodes: async () => {
      await acknowledgeRecoveryCodes(sdk);
    },
    /**
     * Removes the authenticator. A current code from it is the check: one
     * call earns both the "credential:unlink" token (kept by the SDK) and the
     * MFA token the delete takes, as in the backend's demo.
     */
    removeAuthenticator: async (deviceId: string, code: string) => {
      await authenticateTotpMfaDevice(
        {
          code,
          deviceId,
          createMfaTokenOptions: { singleUse: true },
          requestedScopes: [TokenScope.Credentialunlink],
        },
        sdk
      );
      await deleteMfaDevice(
        { deviceId, ...(sdk.mfaToken ? { mfaAuthToken: sdk.mfaToken } : {}) },
        sdk
      );
    },
    /**
     * The second factors the user has. Read from Dynamic's MFA API: an
     * authenticator app is not among the user's verified credentials.
     */
    getSecondFactorMethods: async () => {
      const { devices, passkeys } = await getMfaMethods(sdk);

      return {
        hasAuthenticator: devices.some(
          (device) => `${device.type}` === "totp" && device.verified === true
        ),
        hasPasskey: passkeys.length > 0,
      };
    },
    /** Dynamic did not accept a code from the authenticator or a recovery code */
    isInvalidCodeError: (error: unknown) => error instanceof MfaInvalidOtpError,
    /** The sign-in still owes Dynamic a second factor (authenticator, passkey) */
    needsSecondFactor: () => Boolean(sdk.user) && isUserMissingMfaAuth(sdk),
    passSecondFactorWithCode: async (code: string) => {
      await authenticateTotpMfaDevice({ code }, sdk);
    },
    passSecondFactorWithRecoveryCode: async (code: string) => {
      await authenticateMfaRecoveryCode({ code }, sdk);
    },
    passSecondFactorWithPasskey: async () => {
      await authenticatePasskeyMFA({}, sdk);
    },

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
      displayContainer: HTMLElement,
      /** Needed when the wallet is protected by a password */
      password?: string
    ) =>
      exportWaasPrivateKey(
        {
          walletAccount,
          displayContainer,
          ...(password ? { password } : {}),
        },
        sdk
      ),
  };
}

export type DynamicClient = ReturnType<typeof createDynamicClient>;
export type DynamicWallet = WalletAccount;
export type { OTPVerification };
