import type {
  IntentErrorCode,
  IntentOperationRequest,
  IntentPreview,
  IntentPreviewRequest,
  IntentsApiError,
} from "~/lib/apis/intents";

/**
 * Inputs a preview and the operation request depend on. Any change (account,
 * asset, settlement token, refund address, amount or slippage) invalidates
 * an unfunded review.
 */
export const getIntentRequestKey = (
  request: Partial<IntentPreviewRequest> & { account?: string | null }
) =>
  [
    request.account ?? "",
    request.sourceAssetId ?? "",
    request.settlementTokenId ?? "",
    request.settlementTokenVersion ?? "",
    request.recipient ?? "",
    request.refundAddress ?? "",
    request.amountIn ?? "",
    request.slippageBps ?? "",
  ].join("|");

/** The seven preview fields of an operation request (no accepted minimum). */
export const toIntentPreviewRequest = (
  request: IntentOperationRequest
): IntentPreviewRequest => ({
  sourceAssetId: request.sourceAssetId,
  settlementTokenId: request.settlementTokenId,
  settlementTokenVersion: request.settlementTokenVersion,
  recipient: request.recipient,
  refundAddress: request.refundAddress,
  amountIn: request.amountIn,
  slippageBps: request.slippageBps,
});

/** The preview is older than its `expiresAt` (≤ 30s, backend.md §6.2). */
export const isIntentPreviewExpired = (
  preview: Pick<IntentPreview, "expiresAt">,
  now = Date.now()
) => Date.parse(preview.expiresAt) <= now;

/**
 * Minimum the user accepts when creating the operation, in settlement-token
 * units: the displayed `bridgeableMinAmountOut` (backend.md §6.3). The
 * backend never accepts an executable quote below it.
 */
export const getAcceptedMinAmountOut = (preview: IntentPreview) =>
  preview.bridgeableMinAmountOut;

export const isIntentInstructionsExpired = (
  fundingExpiresAt: string,
  now = Date.now(),
  marginMs = 0
) => Date.parse(fundingExpiresAt) - marginMs <= now;

export const secondsUntil = (at: string, now = Date.now()) =>
  Math.max(0, Math.ceil((Date.parse(at) - now) / 1000));

/** `1:05` or `1:02:05` for Bitcoin's longer windows. */
export const formatCountdown = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = String(seconds % 60).padStart(2, "0");
  return hours
    ? `${hours}:${String(minutes).padStart(2, "0")}:${rest}`
    : `${minutes}:${rest}`;
};

/** `~35 s` / `~4 min`; null when 1Click gave no estimate. */
export const formatTimeEstimate = (seconds: number | null | undefined) =>
  seconds === null || seconds === undefined
    ? null
    : seconds < 90
      ? `~${Math.max(1, Math.round(seconds))} s`
      : `~${Math.round(seconds / 60)} min`;

const errorCopy: Record<IntentErrorCode, string> = {
  VALIDATION_ERROR:
    "The deposit service rejected the request. Check the amount and the refund address, then try again.",
  NOT_FOUND: "This deposit operation can no longer be read.",
  OPERATION_NOT_FOUND: "This deposit operation can no longer be read.",
  SOURCE_ASSET_UNAVAILABLE:
    "This asset is no longer offered. Choose another asset or network.",
  SETTLEMENT_TOKEN_UNAVAILABLE:
    "Deposits are paused right now. Try again later.",
  ADMISSION_CHANGED:
    "Availability changed while getting a price. Review the deposit again.",
  DIRECT_WRAP_UNSUPPORTED: "This asset cannot be deposited this way.",
  AMOUNT_TOO_LOW: "This amount is too low to swap. Enter a larger amount.",
  AMOUNT_TOO_HIGH: "This amount is too high to swap. Enter a smaller amount.",
  PROVIDER_REJECTED:
    "No price is available for this deposit. Change the asset, the amount or the slippage.",
  PREVIEW_BELOW_MINIMUM:
    "You would receive less than the bridge minimum. Enter a larger amount.",
  IDEMPOTENCY_CONFLICT:
    "This deposit request conflicts with an earlier one. Start a new deposit.",
  PAYLOAD_TOO_LARGE: "The deposit request was too large.",
  UNSUPPORTED_MEDIA_TYPE: "The deposit request was not accepted.",
  RATE_LIMITED: "Too many requests. Wait a moment and try again.",
  PREVIEW_BUSY: "Prices are in high demand. Wait a minute and try again.",
  ADMISSION_CAPACITY_EXCEEDED:
    "Too many deposits are waiting to be funded. Fund or abandon an open one, or try again in a minute.",
  INTERNAL_ERROR:
    "The deposit service had a problem. Try again: your request is kept and will not be duplicated.",
  CATALOG_STALE:
    "The list of supported assets is being updated. Try again in a few minutes.",
  METADATA_DISABLED: "Cross-chain deposits are turned off on this deployment.",
  QUOTE_PREVIEW_DISABLED:
    "Prices are turned off on this deployment, so deposits cannot start.",
  RECOVERY_MODE: "Prices are paused right now. Try again later.",
  DEPENDENCY_UNAVAILABLE:
    "The deposit service is temporarily unavailable. Try again: your request is kept and will not be duplicated.",
  METADATA_UNAVAILABLE:
    "The deposit service is temporarily unavailable. Try again shortly.",
  PROVIDER_UNAVAILABLE: "1Click is temporarily unavailable. Try again shortly.",
  PROVIDER_AUTH_UNAVAILABLE:
    "1Click is temporarily unavailable. Try again shortly.",
  INVALID_QUOTE: "The price could not be confirmed. Try again shortly.",
  PREVIEW_EXPIRED: "The price expired. Getting a new one…",
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
 * response was lost (backend.md §5).
 */
export const isRetryableIntentError = (error: IntentsApiError) =>
  [
    "NETWORK",
    "INVALID_RESPONSE",
    "INTERNAL_ERROR",
    "DEPENDENCY_UNAVAILABLE",
    "RATE_LIMITED",
    "UNKNOWN",
  ].includes(error.code) ||
  (error.status !== undefined && error.status >= 500);

/** Metadata changed under the user: refresh it before trying again. */
export const isIntentCatalogChangedError = (error: IntentsApiError) =>
  [
    "SOURCE_ASSET_UNAVAILABLE",
    "SETTLEMENT_TOKEN_UNAVAILABLE",
    "ADMISSION_CHANGED",
    "CATALOG_STALE",
  ].includes(error.code);
