const messages: Record<string, string> = {
  ERROR_KYC_REQUIRED_FOR_LAUNCH: "Verify with Mavryk Pro before purchasing.",
  ERROR_MEMBERSHIP_TIER_NOT_FOUND_FOR_SALE_OPTION:
    "Your membership tier is not eligible for this sale option.",
  ERROR_TOTAL_PRICE_EXCEEDS_MAX_PAYMENT:
    "The purchase price has changed. Review the updated quote and confirm again.",
  ERROR_CANNOT_TRANSFER:
    "This asset cannot be delivered to your jurisdiction. Please contact support.",
  FA2_NOT_OPERATOR:
    "Payment approval is missing. Please retry the purchase to approve the launchpad.",
  FA2_INSUFFICIENT_BALANCE:
    "Insufficient wUSDT balance. Add funds before purchasing.",
  ERROR_AMOUNT_BOUGHT_MUST_EXCEED_MIN_PURCHASE_AMOUNT:
    "Purchase amount is below the sale option minimum.",
};

// Taquito and Beacon may nest Michelson failwith values in data/errors arrays.
function findContractCode(value: unknown, depth = 0): string | undefined {
  if (depth > 8 || value == null) return;
  if (typeof value === "string")
    return value.match(/(?:ERROR_[A-Z_]+|FA2_[A-Z_]+)/)?.[0];
  if (Array.isArray(value)) {
    for (const item of value) {
      const code = findContractCode(item, depth + 1);
      if (code) return code;
    }
  } else if (typeof value === "object") {
    for (const key of [
      "with",
      "string",
      "data",
      "errors",
      "error",
      "body",
      "message",
    ]) {
      const code = findContractCode(
        (value as Record<string, unknown>)[key],
        depth + 1
      );
      if (code) return code;
    }
  }
}

export function primaryPurchaseError(error: unknown): Error {
  const code = findContractCode(error);
  if (!code && error && typeof error === "object") {
    const walletError = error as Record<string, unknown>;
    if (
      walletError.title === "Aborted" ||
      walletError.name === "AbortError" ||
      walletError.name === "AbortedBeaconError"
    ) {
      const aborted = new Error("Operation aborted");
      aborted.name = "AbortError";
      return aborted;
    }
  }
  if (!code)
    return error instanceof Error
      ? error
      : new Error("Unable to complete the purchase. Please retry.");
  const message =
    messages[code] ??
    (/MAX_AMOUNT/.test(code)
      ? "The remaining sale or wallet limit has changed. Review the amount and try again."
      : /NOT_ACTIVE|NOT_STARTED|HAS_ENDED|IS_PAUSED|ENTRYPOINT_PAUSED/.test(
            code
          )
        ? "The sale is currently unavailable. Refresh the launch and try again."
        : "Purchases are temporarily unavailable. Please retry or contact support.");
  return new Error(message);
}
