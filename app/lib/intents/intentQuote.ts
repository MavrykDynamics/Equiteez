import { BigNumber } from "bignumber.js";

import type { IntentSourceAsset } from "~/consts/intents";
import type { IntentErrorCode, IntentsApiError } from "~/lib/apis/intents";

/**
 * Inputs an operation request depends on. Any change (account, source
 * wallet, route, which also fixes network and token, amount or slippage)
 * invalidates an unfunded review/quote.
 */
export function getIntentRequestKey(inputs: {
  account: string | null;
  sourceAddress: string | null;
  routeId: string | undefined;
  routeVersion: number | undefined;
  amountIn: string | null;
  slippageBps: number;
}) {
  return [
    inputs.account ?? "",
    inputs.sourceAddress?.toLowerCase() ?? "",
    inputs.routeId ?? "",
    inputs.routeVersion ?? "",
    inputs.amountIn ?? "",
    inputs.slippageBps,
  ].join("|");
}

/**
 * Minimum output the user explicitly accepts, in settlement ERC-20 units.
 * There is no quote-preview endpoint, so it is estimated from the approved
 * price reference, minus the asset's fee allowance and the chosen slippage,
 * then rounded DOWN to a value the six-decimal FA2 can represent. The
 * backend never lowers it; a quote below it is rejected (closure
 * QUOTE_REJECTED) before any funding is possible.
 */
export function estimateAcceptedMinAmountOut({
  amountIn,
  sourceDecimals,
  settlementDecimals,
  destinationDecimals,
  pricing,
  feeAllowanceBps,
  slippageBps,
}: {
  amountIn: string;
  sourceDecimals: number;
  settlementDecimals: number;
  destinationDecimals: number;
  pricing: IntentSourceAsset["pricing"];
  feeAllowanceBps: number;
  slippageBps: number;
}): { expected: string; minimum: string } | null {
  const rate = pricing.kind === "parity" ? 1 : new BigNumber(pricing.rate);
  const expected = new BigNumber(amountIn)
    .shiftedBy(-sourceDecimals)
    .times(rate)
    .shiftedBy(settlementDecimals)
    .integerValue(BigNumber.ROUND_DOWN);
  const step = new BigNumber(10).pow(
    Math.max(0, settlementDecimals - destinationDecimals)
  );
  const minimum = expected
    .times(10_000 - feeAllowanceBps)
    .div(10_000)
    .times(10_000 - slippageBps)
    .div(10_000)
    .div(step)
    .integerValue(BigNumber.ROUND_DOWN)
    .times(step);
  if (!expected.isFinite() || minimum.lte(0)) return null;
  return { expected: expected.toFixed(), minimum: minimum.toFixed() };
}

export const isIntentInstructionsExpired = (
  fundingExpiresAt: string,
  now = Date.now(),
  marginMs = 0
) => Date.parse(fundingExpiresAt) - marginMs <= now;

export const secondsUntil = (at: string, now = Date.now()) =>
  Math.max(0, Math.ceil((Date.parse(at) - now) / 1000));

const errorCopy: Record<IntentErrorCode, string> = {
  VALIDATION_ERROR:
    "The deposit service rejected the request. Check the amount and wallets, then try again.",
  AMOUNT_OUT_OF_RANGE:
    "This amount is outside the route's limits. Enter a different amount.",
  SLIPPAGE_OUT_OF_RANGE:
    "This slippage tolerance is not allowed for the route. Choose a lower one.",
  MIN_OUTPUT_TOO_LOW:
    "The minimum you would receive is below the route's limit. Enter a larger amount or lower the slippage.",
  NOT_FOUND: "This deposit operation can no longer be read.",
  OPERATION_NOT_FOUND: "This deposit operation can no longer be read.",
  IDEMPOTENCY_CONFLICT:
    "This deposit request conflicts with an earlier one. Start a new deposit.",
  ROUTE_UNAVAILABLE:
    "This route is unavailable right now. Refresh the routes or try again later.",
  PAYLOAD_TOO_LARGE: "The deposit request was too large.",
  UNSUPPORTED_MEDIA_TYPE: "The deposit request was not accepted.",
  RATE_LIMITED: "Too many requests. Wait a moment and try again.",
  INTERNAL_ERROR:
    "The deposit service had a problem. Try again: your request is kept and will not be duplicated.",
  DEPENDENCY_UNAVAILABLE:
    "The deposit service is temporarily unavailable. Try again: your request is kept and will not be duplicated.",
  REHEARSAL_SCOPE_MISMATCH:
    "This test environment only accepts the approved rehearsal transfer.",
  NETWORK:
    "The deposit service is unreachable. Try again: your request is kept and will not be duplicated.",
  INVALID_RESPONSE: "The deposit service returned an unexpected response.",
  UNKNOWN: "The deposit service returned an error. Try again.",
};

/** User copy, with the server request ID for support when available. */
export const getIntentErrorCopy = (error: IntentsApiError) =>
  `${errorCopy[error.code] ?? errorCopy.UNKNOWN}${
    error.requestId ? ` (Request ID: ${error.requestId})` : ""
  }`;

/**
 * Failures after which a POST may already have been committed: retry with the
 * SAME capability, key and body; never generate a new key just because the
 * response was lost (backend.md §2).
 */
export const isRetryableIntentError = (error: IntentsApiError) =>
  [
    "NETWORK",
    "INVALID_RESPONSE",
    "INTERNAL_ERROR",
    "DEPENDENCY_UNAVAILABLE",
    "RATE_LIMITED",
    "UNKNOWN",
  ].includes(error.code);
