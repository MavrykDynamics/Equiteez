import { BigNumber } from "bignumber.js";

import {
  INTENTS_SLIPPAGE_OPTIONS_BPS,
  type IntentBridgePair,
  type IntentSourceAsset,
} from "~/consts/intents";
import type { IntentRoute } from "~/lib/apis/intents";
import { mavrykRecipientSchema } from "~/lib/apis/intents/intents.schema";

export type IntentRouteAvailability =
  | "available"
  | "disabled"
  /** originAsset is not in the approved Equiteez product configuration. */
  | "not_configured"
  | "unsupported_chain"
  /** Does not settle through a known bridge pair (chain, bridge, token). */
  | "unsupported_destination"
  /** Decimals disagree between catalog, product config or token metadata. */
  | "token_mismatch";

/** Funding/display metadata resolved from the approved product config. */
export type IntentRouteSource = IntentSourceAsset & { chainName: string };
export type IntentRouteDestination = {
  tokenAddress: string;
  tokenId: string;
  symbol: string;
  name: string;
  decimals: number;
};

export type IntentRouteOption = {
  route: IntentRoute;
  availability: IntentRouteAvailability;
  source?: IntentRouteSource;
  destination?: IntentRouteDestination;
};

const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

/**
 * A catalog route is usable only when the backend enabled it, it settles
 * through a known bridge pair with matching decimals, its source asset is
 * approved for Equiteez, and a funding adapter exists for its chain.
 */
export function resolveIntentRoute(
  route: IntentRoute,
  {
    sourceAssets,
    bridgePairs,
    chains,
    getDestinationMetadata,
  }: {
    sourceAssets: readonly IntentSourceAsset[];
    bridgePairs: readonly IntentBridgePair[];
    /** Chains configured in wagmi that have a funding adapter. */
    chains: readonly { id: number; name: string }[];
    /** Equiteez token metadata for the destination FA2, when loaded. */
    getDestinationMetadata?: (
      address: string,
      tokenId: string
    ) => { decimals: number } | undefined;
  }
): IntentRouteOption {
  const asset = sourceAssets.find(
    (item) =>
      item.originAsset === route.originAsset &&
      String(item.chainId) === route.sourceChainId
  );
  const chain = asset && chains.find((item) => item.id === asset.chainId);
  const pair = bridgePairs.find(
    (item) =>
      item.settlementChainId === route.settlementChainId &&
      same(item.bridgeAddress, route.bridgeAddress) &&
      same(item.settlementToken, route.settlementToken)
  );
  const source = asset
    ? { ...asset, chainName: chain?.name ?? `Chain ${asset.chainId}` }
    : undefined;
  const destination = pair
    ? {
        tokenAddress: pair.destination.address,
        tokenId: pair.destination.id,
        symbol: pair.destination.symbol,
        name: pair.destination.name,
        decimals: pair.destination.decimals,
      }
    : undefined;
  const option = { route, source, destination };

  if (!route.enabled) return { ...option, availability: "disabled" };
  if (!pair || !destination)
    return { ...option, availability: "unsupported_destination" };
  const metadata = getDestinationMetadata?.(
    destination.tokenAddress,
    destination.tokenId
  );
  if (
    pair.settlementDecimals !== route.settlementDecimals ||
    // Balances use Equiteez metadata; a mismatch would misreport receipt.
    (metadata && metadata.decimals !== destination.decimals) ||
    route.settlementDecimals < destination.decimals
  )
    return { ...option, availability: "token_mismatch" };
  if (!asset) return { ...option, availability: "not_configured" };
  if (asset.decimals !== route.sourceDecimals)
    return { ...option, availability: "token_mismatch" };
  if (!chain) return { ...option, availability: "unsupported_chain" };
  return { ...option, availability: "available" };
}

export const intentRouteAvailabilityCopy: Record<
  Exclude<IntentRouteAvailability, "available">,
  string
> = {
  disabled: "This route is temporarily unavailable.",
  not_configured: "This route is not enabled in Equiteez yet.",
  unsupported_chain: "This source network is not supported in Equiteez yet.",
  unsupported_destination:
    "This route does not settle through a supported Mavryk bridge pair.",
  token_mismatch:
    "This route's token data does not match Equiteez token data, so it is disabled.",
};

export const getIntentRouteLabel = ({ route, source }: IntentRouteOption) =>
  source ? `${source.symbol} on ${source.chainName}` : `Route ${route.id}`;

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
  option: IntentRouteOption,
  amount: BigNumber | undefined,
  balance?: BigNumber
): string | null {
  const { route, source } = option;
  if (!source) return null;
  const { symbol } = source;
  const decimals = route.sourceDecimals;
  if (!amount || amount.isZero()) return "Enter an amount.";
  const raw = toRawAmount(amount, decimals);
  if (raw === null)
    return `${symbol} supports up to ${decimals} decimal places.`;
  if (new BigNumber(raw).lt(route.minAmountIn))
    return `Minimum deposit is ${formatRawAmount(route.minAmountIn, decimals)} ${symbol}.`;
  if (new BigNumber(raw).gt(route.maxAmountIn))
    return `Maximum deposit is ${formatRawAmount(route.maxAmountIn, decimals)} ${symbol}.`;
  if (balance && amount.gt(balance)) return `Insufficient ${symbol} balance.`;
  return null;
}

/**
 * The backend accepts only canonical `mv1` recipients (tz1-equivalent
 * accounts). Other Mavryk account types cannot use this route yet.
 */
export const isIntentRecipient = (address: string | null | undefined) =>
  Boolean(address && mavrykRecipientSchema.safeParse(address).success);

export const getIntentSlippageError = (
  option: IntentRouteOption,
  slippageBps: number
) =>
  !Number.isInteger(slippageBps) || slippageBps < 0
    ? "Choose a slippage tolerance."
    : slippageBps > option.route.maxSlippageBps
      ? `This route allows at most ${formatBps(option.route.maxSlippageBps)} slippage.`
      : null;

export const formatBps = (bps: number) =>
  `${new BigNumber(bps).div(100).toFormat()}%`;

/**
 * Slippage choices for a route: options above its maximum are hidden, and a
 * route stricter than the smallest option offers its own maximum.
 */
export function getIntentSlippageChoices(maxSlippageBps: number): number[] {
  const allowed = INTENTS_SLIPPAGE_OPTIONS_BPS.filter(
    (bps) => bps <= maxSlippageBps
  );
  return allowed.length ? allowed : [maxSlippageBps];
}
