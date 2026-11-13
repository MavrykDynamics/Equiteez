import { BigNumber } from "bignumber.js";

import type {
  IntentErrorCode,
  IntentOperation,
  IntentQuote,
  IntentsApiError,
} from "~/lib/apis/intents";

/**
 * Inputs a quote depends on. Any change (account, source wallet, route, which
 * also fixes network and token, or amount) invalidates the quote.
 */
export function getIntentQuoteKey(inputs: {
  account: string | null;
  sourceAddress: string | null;
  routeId: string | undefined;
  amountIn: string | null;
}) {
  return [
    inputs.account ?? "",
    inputs.sourceAddress?.toLowerCase() ?? "",
    inputs.routeId ?? "",
    inputs.amountIn ?? "",
  ].join("|");
}

export const isIntentQuoteExpired = (expiresAt: string, now = Date.now()) =>
  Date.parse(expiresAt) <= now;

export const secondsUntil = (expiresAt: string, now = Date.now()) =>
  Math.max(0, Math.ceil((Date.parse(expiresAt) - now) / 1000));

/**
 * Lower expected or minimum output, or different inputs, between the preview
 * and the executable quote need a fresh confirmation.
 */
export function hasMaterialQuoteChange(
  preview: IntentQuote,
  operation: IntentOperation
) {
  return (
    preview.amountIn !== operation.amountIn ||
    preview.recipient !== operation.recipient ||
    new BigNumber(operation.amountOut).lt(preview.amountOut) ||
    new BigNumber(operation.minAmountOut).lt(preview.minAmountOut)
  );
}

const errorCopy: Record<
  IntentErrorCode | "network" | "invalid_response",
  string
> = {
  sponsorship_unavailable:
    "Sponsored forwarding is temporarily unavailable. Try again later, or use Bridge From Ethereum.",
  destination_busy:
    "Another deposit to your account is still being forwarded. Wait for it to finish, then try again.",
  quote_expired: "The quote expired. Refresh it to continue.",
  below_minimum:
    "This amount is below the minimum the route can deliver. Enter a larger amount.",
  route_disabled: "This route is temporarily unavailable. Choose another one.",
  unauthorized: "The deposit service declined this request.",
  rate_limited: "Too many requests. Wait a moment and try again.",
  not_found: "The deposit operation was not found.",
  internal: "The deposit service returned an error. Try again.",
  network:
    "The deposit service is unreachable. Check your connection and try again.",
  invalid_response: "The deposit service returned an unexpected response.",
};

export const getIntentErrorCopy = (error: IntentsApiError) =>
  errorCopy[error.code] ?? errorCopy.internal;

/**
 * Codes after which the backend definitely did not create the operation, so
 * a later attempt must use a new idempotency key.
 */
export const isDefinitiveIntentRejection = (error: IntentsApiError) =>
  [
    "sponsorship_unavailable",
    "destination_busy",
    "quote_expired",
    "below_minimum",
    "route_disabled",
    "unauthorized",
  ].includes(error.code);
