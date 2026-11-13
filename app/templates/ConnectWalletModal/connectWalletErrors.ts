/**
 * What the connect modal shows for a failed step. Dynamic's own errors have
 * no stable codes in SDK 4.84, so OTP problems are recognized by message.
 */
import { isWalletAbortActionError } from "~/contracts/hooks/contractActionError";
import type { DynamicWalletOption } from "~/providers/WalletProvider/dynamic/dynamic.errors";

export type ConnectStage = "email" | "code" | "connect";

export type ConnectErrorView =
  | { kind: "select-wallet"; wallets: DynamicWalletOption[] }
  | { kind: "message"; message: string };

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
  if (stage === "email" && /email/i.test(text)) {
    return message(CONNECT_ERROR_MESSAGES.invalidEmail);
  }

  // Our own errors carry user-facing messages (e.g. invalid signature)
  return message(text || CONNECT_ERROR_MESSAGES.generic);
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (email: string) => EMAIL_PATTERN.test(email.trim());
