import { BigNumber } from "bignumber.js";

import type { IntentRoute } from "~/lib/apis/intents";

export type IntentRouteAvailability =
  | "available"
  | "disabled"
  | "unsupported_chain"
  | "unsupported_destination"
  | "token_mismatch";

/**
 * A catalog route is usable only when the backend enabled it, Equiteez has a
 * funding adapter for its source chain, and it delivers to the expected
 * Mavryk network.
 */
export function getIntentRouteAvailability(
  route: IntentRoute,
  supportedChainIds: readonly number[],
  destinationNetwork: string,
  /** Equiteez metadata for the destination token, when known. */
  destinationMetadata?: { decimals: number }
): IntentRouteAvailability {
  if (!route.enabled) return "disabled";
  if (route.destination.network !== destinationNetwork)
    return "unsupported_destination";
  // Balances use Equiteez metadata; a decimals mismatch would misreport receipt.
  if (
    destinationMetadata &&
    destinationMetadata.decimals !== route.destination.decimals
  )
    return "token_mismatch";
  if (!supportedChainIds.includes(route.source.chainId))
    return "unsupported_chain";
  return "available";
}

export const intentRouteAvailabilityCopy: Record<
  Exclude<IntentRouteAvailability, "available">,
  string
> = {
  disabled: "This route is temporarily unavailable.",
  unsupported_chain: "This source network is not supported in Equiteez yet.",
  unsupported_destination: "This route does not deliver to Mavryk Basenet.",
  token_mismatch:
    "This route's Mavryk token does not match Equiteez token data, so it is disabled.",
};

/** Raw integer units, or null when the amount has more decimals than the token. */
export function toRawAmount(amount: BigNumber, decimals: number) {
  if (!amount.isFinite() || amount.isNegative()) return null;
  if ((amount.decimalPlaces() ?? 0) > decimals) return null;
  return amount
    .shiftedBy(decimals)
    .integerValue(BigNumber.ROUND_DOWN)
    .toFixed();
}

export const fromRawAmount = (raw: string, decimals: number) =>
  new BigNumber(raw).shiftedBy(-decimals);

export const formatRawAmount = (raw: string, decimals: number) =>
  fromRawAmount(raw, decimals).toFormat();

/** Validation in raw units so limits are compared without float rounding. */
export function getIntentAmountError(
  route: IntentRoute,
  amount: BigNumber | undefined,
  balance?: BigNumber
): string | null {
  const { decimals, symbol } = route.source.token;
  if (!amount || amount.isZero()) return "Enter an amount.";
  const raw = toRawAmount(amount, decimals);
  if (raw === null)
    return `${symbol} supports up to ${decimals} decimal places.`;
  if (new BigNumber(raw).lt(route.minAmountIn))
    return `Minimum deposit is ${formatRawAmount(route.minAmountIn, decimals)} ${symbol}.`;
  if (route.maxAmountIn && new BigNumber(raw).gt(route.maxAmountIn))
    return `Maximum deposit is ${formatRawAmount(route.maxAmountIn, decimals)} ${symbol}.`;
  if (balance && amount.gt(balance)) return `Insufficient ${symbol} balance.`;
  return null;
}
