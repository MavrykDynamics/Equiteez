/** Errors of the Dynamic wallet flow, each mapped to its own UI state. */

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
  constructor() {
    super("Your email wallet could not be found.");
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

/** The SDK returned a signature that does not verify: never submit it. */
export class LocalSignatureVerificationError extends Error {
  constructor() {
    super("The wallet returned an invalid signature. Nothing was sent.");
    this.name = "LocalSignatureVerificationError";
  }
}
