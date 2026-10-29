import { RelayApiError } from "./relay.errors";

export const CREDIT_SHORTAGE_MESSAGE =
  "You’re out of Credits. Please Top Up your balance. Your order has been preserved.";

/**
 * What the user can do about a relay failure:
 * - credit-shortage: only FEE_CREDIT_REQUIRED; offer Top Up.
 * - unavailable: sponsor/infrastructure, unsupported contract or quota; offer
 *   an explicit MVRK choice, never Top Up.
 * - payment-mismatch: the saved method is no longer Credits; reread it.
 */
export type RelayFailureKind =
  | "credit-shortage"
  | "unavailable"
  | "payment-mismatch";
export type RelayFailureNotice = {
  kind: RelayFailureKind;
  /** Short cause; the UI appends its own call to action. */
  reason: string;
  /** Complete sentence for toasts and plain-text surfaces. */
  message: string;
};

const SWITCH_TO_MVRK = "Try again later or switch to MVRK in Profile settings.";

const formatRetryAfter = (ms: number) => {
  const seconds = Math.ceil(ms / 1000);
  return seconds >= 60
    ? `${Math.ceil(seconds / 60)} min`
    : `${Math.max(seconds, 1)} s`;
};

const unavailable = (reason: string): RelayFailureNotice => ({
  kind: "unavailable",
  reason,
  message: `${reason} ${SWITCH_TO_MVRK}`,
});

/** Branches on the public code, never on message text. */
export function getRelayNoticeForCode(
  code: string,
  retryAfterMs = 0
): RelayFailureNotice | null {
  switch (code) {
    case "FEE_CREDIT_REQUIRED":
      return {
        kind: "credit-shortage",
        reason: "You’re out of Gas Credits.",
        message: CREDIT_SHORTAGE_MESSAGE,
      };
    case "PAYMENT_METHOD_MISMATCH":
      return {
        kind: "payment-mismatch",
        reason: "Your saved payment method was changed to MVRK.",
        message:
          "Your saved payment method was changed to MVRK. Review the order and submit it again.",
      };
    // Sponsor shortage and infrastructure failures are normalised to this code.
    case "RELAY_UNAVAILABLE":
      return unavailable("Gas Station is temporarily unavailable.");
    // Local: a successful config read with the relay explicitly off.
    case "RELAY_DISABLED":
      return unavailable("Gas Station is turned off right now.");
    case "CONTRACT_NOT_RELAYABLE":
      return unavailable(
        "Gas Credits can't be used for this asset or action yet."
      );
    case "RELAY_QUOTA_EXCEEDED":
    case "QUOTA_EXCEEDED":
      return unavailable(
        retryAfterMs > 0
          ? `Gas Station limit reached. It resets in ${formatRetryAfter(retryAfterMs)}.`
          : "Gas Station limit reached."
      );
    default:
      return null;
  }
}

export function getRelayFailureNotice(
  error: unknown
): RelayFailureNotice | null {
  return error instanceof RelayApiError
    ? getRelayNoticeForCode(error.code, error.retryAfterMs)
    : null;
}
