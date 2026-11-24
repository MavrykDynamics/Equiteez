/** Errors of the Dynamic wallet flow, each mapped to its own UI state. */

/**
 * The browser's passkey prompt (Touch ID, Face ID, screen lock) was closed
 * or timed out: the user changed their mind, not an error to show.
 */
export const isPasskeyPromptDismissed = (error: unknown) =>
  error instanceof Error &&
  /NotAllowedError|AbortError|not allowed|cancel|timed out/i.test(
    `${error.name} ${error.message}`
  );

export class DynamicNotConfiguredError extends Error {
  constructor() {
    super("Email wallets are not configured for this environment.");
    this.name = "DynamicNotConfiguredError";
  }
}

/**
 * The SDK or its signing iframe failed to load: usually an origin missing from
 * the Dynamic CORS allowlist. Not a wrong OTP.
 */
export class DynamicInitError extends Error {
  constructor(
    message = "Email wallet service failed to load.",
    cause?: unknown
  ) {
    super(message, { cause });
    this.name = "DynamicInitError";
  }
}

export class DynamicNotAuthenticatedError extends Error {
  constructor() {
    super("Sign in with your email first.");
    this.name = "DynamicNotAuthenticatedError";
  }
}

/** Dynamic still remembers the user, but its session token has expired. */
export class DynamicSessionExpiredError extends Error {
  constructor() {
    super(
      "Your email sign-in has expired. Sign out and sign in again, then export your key."
    );
    this.name = "DynamicSessionExpiredError";
  }
}

/**
 * Another tab signed in, so this tab's Dynamic session is out of date
 * (dynamicTabSync.ts). The page reloads to pick up the current one.
 */
export class DynamicTabOutdatedError extends Error {
  constructor(cause?: unknown) {
    super("You signed in in another tab. Reloading this page to continue…", {
      cause,
    });
    this.name = "DynamicTabOutdatedError";
  }
}

/**
 * Dynamic ended the session during a sign-in step, e.g. another tab replaced
 * its signing key. The step's own error (often "Forbidden") is the cause.
 */
export class DynamicSignInInterruptedError extends Error {
  constructor(cause?: unknown) {
    super("Your sign-in was interrupted. Please sign in again.", { cause });
    this.name = "DynamicSignInInterruptedError";
  }
}

export type DynamicWalletOption = {
  walletId: string;
  /** mv1 address, what the user recognizes */
  address: string;
};

/** Several embedded wallets and none saved: the user has to pick one. */
export class MultipleDynamicWalletsError extends Error {
  constructor(public readonly wallets: DynamicWalletOption[]) {
    super("Several wallets were found for this account.");
    this.name = "MultipleDynamicWalletsError";
  }
}

export class DynamicWalletNotFoundError extends Error {
  constructor(message = "Your email wallet could not be found.") {
    super(message);
    this.name = "DynamicWalletNotFoundError";
  }
}

/** The selected wallet or session changed while a signature was pending. */
export class DynamicIdentityChangedError extends Error {
  constructor() {
    super("Your wallet changed while signing. Please try again.");
    this.name = "DynamicIdentityChangedError";
  }
}

/**
 * The wallet is protected by a password and comes locked in this browser
 * (a new device or session): it must be unlocked before it can sign.
 */
export class DynamicWalletLockedError extends Error {
  constructor(
    public readonly wallet: DynamicWalletOption & {
      /** When the wallet was last selected, if Dynamic knows */
      lastUsedAt: Date | null;
      email: string | null;
    }
  ) {
    super("Enter your account password to restore your account here.");
    this.name = "DynamicWalletLockedError";
  }
}

/** The password did not unlock the wallet. */
export class DynamicWrongPasswordError extends Error {
  constructor(cause?: unknown) {
    super("That password didn't work. Check it and try again.", { cause });
    this.name = "DynamicWrongPasswordError";
  }
}

/** "Set" found a password already there: the user has to change it. */
export class DynamicPasswordAlreadySetError extends Error {
  constructor(cause?: unknown) {
    super(
      "Your wallet already has a password. Enter the current one to change it.",
      { cause }
    );
    this.name = "DynamicPasswordAlreadySetError";
  }
}

/**
 * The sign-in owes Dynamic a second factor: the user has an authenticator
 * app or a passkey, and Dynamic wants it before the session is complete.
 */
export class DynamicSecondFactorRequiredError extends Error {
  constructor(
    public readonly methods: { hasAuthenticator: boolean; hasPasskey: boolean }
  ) {
    super("Confirm your sign-in with your authenticator app.");
    this.name = "DynamicSecondFactorRequiredError";
  }
}

/** A code from the authenticator app (or a recovery code) was not accepted. */
export class DynamicWrongCodeError extends Error {
  constructor(cause?: unknown) {
    super("That code didn't work. Check it and try again.", { cause });
    this.name = "DynamicWrongCodeError";
  }
}

/** The return from Google did not sign the user in. */
export class GoogleSignInError extends Error {
  constructor(
    message = "Google sign-in didn't finish. Please try again.",
    cause?: unknown
  ) {
    super(message, { cause });
    this.name = "GoogleSignInError";
  }
}

/** The user closed "Confirm it's you": nothing was changed. */
export class IdentityCheckCancelledError extends Error {
  constructor() {
    super("Verification was cancelled, so nothing was changed.");
    this.name = "IdentityCheckCancelledError";
  }
}

/**
 * Dynamic wants a fresh check but none of the user's credentials is one the
 * app can confirm with (e.g. only a social account, not offered yet).
 */
export class IdentityCheckUnavailableError extends Error {
  constructor() {
    super(
      "We can't confirm it's you on this account yet. Please contact support."
    );
    this.name = "IdentityCheckUnavailableError";
  }
}

/** The SDK returned a signature that does not verify: never submit it. */
export class LocalSignatureVerificationError extends Error {
  constructor() {
    super("The wallet returned an invalid signature. Nothing was sent.");
    this.name = "LocalSignatureVerificationError";
  }
}
