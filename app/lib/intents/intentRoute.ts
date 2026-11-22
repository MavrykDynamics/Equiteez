import { BigNumber } from "bignumber.js";

import {
  INTENTS_EXACT_PARITY_MODES,
  INTENTS_SLIPPAGE_OPTIONS_BPS,
  type IntentBridgePair,
} from "~/consts/intents";
import type {
  IntentMetadata,
  IntentMetadataRoute,
  IntentRoute,
} from "~/lib/apis/intents";
import { mavrykRecipientSchema } from "~/lib/apis/intents/intents.schema";

export type IntentRouteAvailability =
  | "available"
  | "disabled"
  /** `admissionPaused` in metadata: no new operations for now. */
  | "paused"
  /** No `/v1/metadata` entry with a usable source asset for this route. */
  | "not_configured"
  /** Needs an indicative quote (`/v1/quotes/preview`), not integrated yet. */
  | "preview_required"
  /** Rehearsal route without connected-wallet hash registration. */
  | "registration_unsupported"
  | "unsupported_chain"
  /** Does not settle through a known bridge pair (chain, bridge, token). */
  | "unsupported_destination"
  /** Decimals or token identity disagree between catalog, metadata or pair. */
  | "token_mismatch";

/** Token the wallet transfers, from `/v1/metadata` (never a ticker guess). */
export type IntentRouteSource = {
  originAsset: string;
  chainId: number;
  chainName: string;
  token: "native" | `0x${string}`;
  symbol: string;
  decimals: number;
};
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
  /** The wallet's funding hash must be registered (backend.md §4.5). */
  hasDepositRegistration: boolean;
};

const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

/** Source token from metadata, when it is coherent with the route. */
function toSource(
  route: IntentRoute,
  meta: IntentMetadataRoute | undefined,
  chainName: string | undefined
): IntentRouteSource | undefined {
  const asset = meta?.sourceAsset;
  if (
    !asset ||
    asset.assetId !== route.originAsset ||
    asset.chainId !== route.sourceChainId
  )
    return undefined;
  const token =
    asset.kind === "native"
      ? ("native" as const)
      : asset.kind === "erc20"
        ? asset.contractAddress
        : undefined;
  if (!token) return undefined;
  const chainId = Number(asset.chainId);
  return {
    originAsset: asset.assetId,
    chainId,
    chainName: chainName ?? `Chain ${chainId}`,
    token,
    symbol: asset.symbol,
    decimals: asset.decimals,
  };
}

/**
 * A catalog route (`/v1/routes`, the technical contract) is usable only when
 * the backend enabled it and admission is open, it settles through a known
 * bridge pair with matching decimals, `/v1/metadata` supplies its source
 * token and the same destination FA2, Equiteez can price it, and a funding
 * adapter exists for its chain.
 */
export function resolveIntentRoute(
  route: IntentRoute,
  {
    metadata,
    bridgePairs,
    chains,
    getDestinationMetadata,
  }: {
    metadata: IntentMetadata | null;
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
  const meta = metadata?.routes.find(
    (item) => item.routeId === route.id && item.routeVersion === route.version
  );
  const chain = chains.find((item) => String(item.id) === route.sourceChainId);
  const source = toSource(route, meta, chain?.name);
  const pair = bridgePairs.find(
    (item) =>
      item.settlementChainId === route.settlementChainId &&
      same(item.bridgeAddress, route.bridgeAddress) &&
      same(item.settlementToken, route.settlementToken)
  );
  const destination = pair
    ? {
        tokenAddress: pair.destination.address,
        tokenId: pair.destination.id,
        symbol: pair.destination.symbol,
        name: pair.destination.name,
        decimals: pair.destination.decimals,
      }
    : undefined;
  const option = {
    route,
    source,
    destination,
    hasDepositRegistration: Boolean(meta?.depositRegistrationSupported),
  };

  if (!route.enabled) return { ...option, availability: "disabled" };
  if (metadata?.admissionPaused) return { ...option, availability: "paused" };
  if (!pair || !destination)
    return { ...option, availability: "unsupported_destination" };
  const tokenMetadata = getDestinationMetadata?.(
    destination.tokenAddress,
    destination.tokenId
  );
  if (
    pair.settlementDecimals !== route.settlementDecimals ||
    // Balances use Equiteez metadata; a mismatch would misreport receipt.
    (tokenMetadata && tokenMetadata.decimals !== destination.decimals) ||
    route.settlementDecimals < destination.decimals
  )
    return { ...option, availability: "token_mismatch" };
  if (!meta || !source) return { ...option, availability: "not_configured" };
  if (
    source.decimals !== route.sourceDecimals ||
    !meta.settlementAsset.contractAddress ||
    !same(meta.settlementAsset.contractAddress, route.settlementToken) ||
    meta.settlementAsset.decimals !== route.settlementDecimals ||
    meta.destinationAsset.contractAddress !== destination.tokenAddress ||
    meta.destinationAsset.tokenId !== destination.tokenId ||
    meta.destinationAsset.decimals !== destination.decimals
  )
    return { ...option, availability: "token_mismatch" };
  if (!INTENTS_EXACT_PARITY_MODES.includes(meta.mode))
    return { ...option, availability: "preview_required" };
  if (!meta.depositRegistrationSupported)
    return { ...option, availability: "registration_unsupported" };
  if (!chain) return { ...option, availability: "unsupported_chain" };
  return { ...option, availability: "available" };
}

export const intentRouteAvailabilityCopy: Record<
  Exclude<IntentRouteAvailability, "available">,
  string
> = {
  disabled: "This route is temporarily unavailable.",
  paused:
    "The deposit service is not accepting new transfers right now. Try again later.",
  not_configured: "This route is not enabled in Equiteez yet.",
  preview_required: "Quotes for this route are not available in Equiteez yet.",
  registration_unsupported:
    "This test route does not accept connected-wallet transfers yet.",
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
