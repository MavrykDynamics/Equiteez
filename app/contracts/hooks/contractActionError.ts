/**
 * How a failed contract action is shown. An action whose transaction may
 * still execute is never reported as failed (docs/dynamic-wallet.md §9.2).
 */
import { checkWhetherWalletAbortError } from "~/errors/error";

export type ContractActionErrorKind =
  /** Declined in the wallet before anything was sent */
  | "abort"
  /** A duplicate click or another tab is already submitting it */
  | "in-progress"
  /** Sent, or blocked by an earlier send, and the result is not known yet */
  | "still-processing"
  | "error";

const STILL_PROCESSING_ERRORS = new Set([
  "OperationOutcomeUnknownError",
  "BroadcastOutcomeUnknownError",
  "UnresolvedAttemptError",
]);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const getStringField = (value: Record<string, unknown>, key: string) => {
  const field = value[key];

  return typeof field === "string" ? field : "";
};

export const isWalletAbortActionError = (rawError: unknown) => {
  if (checkWhetherWalletAbortError(rawError)) return true;

  if (!isRecord(rawError)) return false;

  const name = getStringField(rawError, "name");
  const title = getStringField(rawError, "title");
  const message = getStringField(rawError, "message").toLowerCase();

  return (
    name === "AbortError" ||
    name === "AbortedBeaconError" ||
    title === "Aborted" ||
    message.includes("aborted")
  );
};

export function classifyContractActionError(
  error: unknown,
  { hasSubmitted }: { hasSubmitted: boolean }
): ContractActionErrorKind {
  const name = error instanceof Error ? error.name : "";

  if (name === "ActionInProgressError") return "in-progress";
  if (STILL_PROCESSING_ERRORS.has(name)) return "still-processing";
  if (name === "OperationFailedOnChainError") return "error";

  // e.g. confirmation timed out after the wallet returned a hash
  if (hasSubmitted) return "still-processing";

  return isWalletAbortActionError(error) ? "abort" : "error";
}
