/**
 * What the connect modal shows for a failed step. Dynamic's own errors have
 * no stable codes, so OTP problems are recognized by message.
 */
import { isWalletAbortActionError } from "~/contracts/hooks/contractActionError";
import type {
  DynamicSecondFactorRequiredError,
  DynamicWalletLockedError,
  DynamicWalletOption,
} from "~/providers/WalletProvider/dynamic/dynamic.errors";

export type LockedWallet = DynamicWalletLockedError["wallet"];
export type SecondFactorMethods = DynamicSecondFactorRequiredError["methods"];

export type ConnectStage =
  | "email"
  | "code"
  | "connect"
  | "unlock"
  | "second-factor";

export type ConnectErrorView =
  | { kind: "select-wallet"; wallets: DynamicWalletOption[] }
  | { kind: "unlock"; wallet: LockedWallet }
  | { kind: "second-factor"; methods: SecondFactorMethods }
  | {
      kind: "message";
      message: string;
      /** The sign-in has to start over from the email step */
      shouldRestart?: boolean;
    };

const message = (text: string): ConnectErrorView => ({
  kind: "message",
  message: text,
});

export const CONNECT_ERROR_MESSAGES = {
  unavailable:
    "Email sign-in is unavailable right now. Please try again later or use Mavryk Wallet.",
  cancelled: "Signing was cancelled. Try again when you're ready.",
  rateLimited: "Too many attempts. Wait a minute and try again.",
  invalidCode: "That code didn't work or has expired. Check it or resend.",
  invalidEmail: "Enter a valid email address.",
  unlockFailed:
    "We couldn't unlock your account. Check your password and try again.",
  network: "The Mavryk network is unavailable right now. Please try again.",
  generic: "Something went wrong. Please try again.",
};

const errorName = (error: unknown) =>
  error instanceof Error ? error.name : "";

const errorText = (error: unknown) =>
  error instanceof Error
    ? error.message
    : typeof error === "string"
      ? error
      : "";

export function describeConnectError(
  error: unknown,
  stage: ConnectStage
): ConnectErrorView {
  const name = errorName(error);
  const text = errorText(error);

  if (name === "MultipleDynamicWalletsError") {
    return {
      kind: "select-wallet",
      wallets: (error as { wallets: DynamicWalletOption[] }).wallets,
    };
  }

  if (name === "DynamicWalletLockedError") {
    return {
      kind: "unlock",
      wallet: (error as DynamicWalletLockedError).wallet,
    };
  }

  // Our own errors with messages written for this modal
  if (name === "DynamicSecondFactorRequiredError") {
    return {
      kind: "second-factor",
      methods: (error as DynamicSecondFactorRequiredError).methods,
    };
  }

  // The session ended midway (e.g. another tab replaced its key): the steps
  // already done no longer count
  if (name === "DynamicSignInInterruptedError") {
    return { kind: "message", message: text, shouldRestart: true };
  }

  if (
    name === "DynamicTabOutdatedError" ||
    name === "GoogleSignInError" ||
    name === "DynamicWrongPasswordError" ||
    name === "DynamicWrongCodeError"
  ) {
    return message(text);
  }

  if (name === "DynamicInitError" || name === "DynamicNotConfiguredError") {
    return message(CONNECT_ERROR_MESSAGES.unavailable);
  }
  if (name === "WrongNetworkError") {
    return message(CONNECT_ERROR_MESSAGES.network);
  }
  if (/too many|rate.?limit|429/i.test(text)) {
    return message(CONNECT_ERROR_MESSAGES.rateLimited);
  }
  if (isWalletAbortActionError(error) || /reject|cancel/i.test(text)) {
    return message(CONNECT_ERROR_MESSAGES.cancelled);
  }
  if (stage === "code") {
    return message(CONNECT_ERROR_MESSAGES.invalidCode);
  }
  // Not recognized as a wrong password: say what may be wrong, not that it is
  if (stage === "unlock") {
    return message(CONNECT_ERROR_MESSAGES.unlockFailed);
  }
  if (stage === "email" && /email/i.test(text)) {
    return message(CONNECT_ERROR_MESSAGES.invalidEmail);
  }

  // Our own errors carry user-facing messages (e.g. invalid signature)
  return message(text || CONNECT_ERROR_MESSAGES.generic);
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (email: string) => EMAIL_PATTERN.test(email.trim());
