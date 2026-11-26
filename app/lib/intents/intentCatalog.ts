import { BigNumber } from "bignumber.js";

import type {
  IntentMetadata,
  IntentSettlementToken,
  IntentSourceAsset,
} from "~/lib/apis/intents";
import { mavrykRecipientSchema } from "~/lib/apis/intents/intents.schema";
import { getIntentNetwork, type IntentNetwork } from "./intentNetworks";

/**
 * Why the flow cannot start, from `GET /v1/metadata` (backend.md §6.1).
 * Each one stops new transfers; existing operations stay readable.
 */
export type IntentCatalogStatus =
  | "available"
  /** `admissionPaused`: no new transfers for now. */
  | "paused"
  /** `catalog.stale`: the asset list is out of date. */
  | "stale"
  /** No default settlement token, or its entry is missing. Never fall back. */
  | "no_settlement_token"
  /** Previews are unavailable for the settlement token. */
  | "preview_unavailable"
  /** The destination FA2 disagrees with Equiteez token data. */
  | "token_mismatch"
  /** No source asset on a network this app knows. */
  | "no_assets";

/** What the user receives on Mavryk. */
export type IntentDestination = {
  tokenAddress: string;
  tokenId: string;
  symbol: string;
  decimals: number;
  mavrykChainId: string;
};

/** The default settlement token the bridge wraps (USDT0 on Arbitrum One). */
export type IntentSettlement = {
  id: string;
  version: number;
  symbol: string;
  decimals: number;
  chainId: string;
  destination: IntentDestination;
};

/** A source asset the user can pick, joined with its static network data. */
export type IntentSourceOption = {
  /** `sourceAssetId`: opaque, never parsed. */
  assetId: string;
  asset: IntentSourceAsset;
  network: IntentNetwork;
  /**
   * What a connected EVM wallet transfers; undefined for non-EVM assets or an
   * EVM token whose contract is not an EVM address.
   */
  evmToken?: "native" | `0x${string}`;
};

export type IntentCatalog = {
  status: IntentCatalogStatus;
  settlement?: IntentSettlement;
  options: IntentSourceOption[];
};

const EVM_ADDRESS = /^0x[0-9a-fA-F]{40}$/;

/**
 * Display symbol of the wrapped destination token. Equiteez token metadata
 * wins; otherwise the bridge's naming (USDT0 → wUSDT, USDC → wUSDC).
 */
const wrappedSymbol = (settlementSymbol: string) =>
  `w${settlementSymbol.replace(/0$/, "")}`;

function toSourceOption(
  asset: IntentSourceAsset,
  settlement: IntentSettlementToken
): IntentSourceOption | null {
  const network = getIntentNetwork(asset.network);
  // Unknown networks, families or modes are hidden (backend.md §6.1).
  if (!network || network.family !== asset.family) return null;
  if (asset.kind === "UNKNOWN" || asset.depositMode === "UNKNOWN") return null;
  if (network.family === "evm") {
    if (asset.evmChainId !== String(network.evmChainId)) return null;
  } else if (asset.evmChainId !== null) return null;
  // The settlement token itself is never a source (DIRECT_WRAP_UNSUPPORTED).
  if (asset.assetId === settlement.settlementAsset.assetId) return null;
  const evmToken =
    network.family !== "evm"
      ? undefined
      : asset.kind === "native"
        ? ("native" as const)
        : asset.contractAddress && EVM_ADDRESS.test(asset.contractAddress)
          ? (asset.contractAddress as `0x${string}`)
          : undefined;
  return { assetId: asset.assetId, asset, network, evmToken };
}

/**
 * Resolves metadata into what the form offers: the default settlement token
 * (no selector, never a fallback) with its Mavryk destination, and the
 * source assets on known networks, in metadata order.
 */
export function resolveIntentCatalog(
  metadata: IntentMetadata,
  {
    getDestinationMetadata,
  }: {
    /** Equiteez token metadata for the destination FA2, when loaded. */
    getDestinationMetadata?: (
      address: string,
      tokenId: string
    ) => { decimals: number; symbol?: string } | undefined;
  } = {}
): IntentCatalog {
  const preferred = metadata.defaultSettlementToken;
  const token = preferred
    ? metadata.settlementTokens.find(
        (item) =>
          item.settlementTokenId === preferred.settlementTokenId &&
          item.settlementTokenVersion === preferred.settlementTokenVersion
      )
    : undefined;
  if (!token) return { status: "no_settlement_token", options: [] };

  const { destinationAsset, settlementAsset } = token;
  const known = getDestinationMetadata?.(
    destinationAsset.contractAddress,
    destinationAsset.tokenId
  );
  const settlement: IntentSettlement = {
    id: token.settlementTokenId,
    version: token.settlementTokenVersion,
    symbol: settlementAsset.symbol,
    decimals: settlementAsset.decimals,
    chainId: settlementAsset.chainId,
    destination: {
      tokenAddress: destinationAsset.contractAddress,
      tokenId: destinationAsset.tokenId,
      symbol: known?.symbol ?? wrappedSymbol(settlementAsset.symbol),
      decimals: destinationAsset.decimals,
      mavrykChainId: destinationAsset.chainId,
    },
  };
  const options = metadata.sourceAssets.flatMap(
    (asset) => toSourceOption(asset, token) ?? []
  );
  const result = (status: IntentCatalogStatus): IntentCatalog => ({
    status,
    settlement,
    options,
  });

  if (metadata.admissionPaused) return result("paused");
  if (metadata.catalog.stale) return result("stale");
  if (
    destinationAsset.kind !== "fa2" ||
    // Balances use Equiteez metadata; a mismatch would misreport receipt.
    (known && known.decimals !== destinationAsset.decimals)
  )
    return result("token_mismatch");
  if (!token.previewSupported) return result("preview_unavailable");
  if (!options.length) return result("no_assets");
  return result("available");
}

export const intentCatalogStatusCopy: Record<
  Exclude<IntentCatalogStatus, "available">,
  string
> = {
  paused:
    "The deposit service is not accepting new transfers right now. Try again later.",
  stale:
    "The list of supported assets is being updated. Try again in a few minutes.",
  no_settlement_token:
    "Cross-chain deposits are not enabled on this deployment yet.",
  preview_unavailable:
    "Prices are temporarily unavailable, so new transfers cannot start. Try again later.",
  token_mismatch:
    "The token you would receive does not match Equiteez token data, so deposits are disabled.",
  no_assets: "No source assets are available right now. Try again later.",
};

export const getIntentSourceLabel = ({ asset, network }: IntentSourceOption) =>
  `${asset.symbol} on ${network.name}`;

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

/**
 * Amount checks in raw units. There is no backend minimum or maximum: 1Click
 * accepts the amount or the preview answers AMOUNT_TOO_LOW/HIGH.
 */
export function getIntentAmountError(
  option: IntentSourceOption,
  amount: BigNumber | undefined,
  balance?: BigNumber
): string | null {
  const { symbol, decimals } = option.asset;
  if (!amount || amount.isZero()) return "Enter an amount.";
  const raw = toRawAmount(amount, decimals);
  if (raw === null)
    return `${symbol} supports up to ${decimals} decimal places.`;
  if (raw === "0") return "Enter an amount.";
  if (balance && amount.gt(balance)) return `Insufficient ${symbol} balance.`;
  return null;
}

/**
 * The backend accepts only canonical `mv1` recipients with a valid checksum
 * (backend.md §7). Other Mavryk account types cannot use this flow.
 */
export const isIntentRecipient = (address: string | null | undefined) =>
  Boolean(address && mavrykRecipientSchema.safeParse(address).success);

export const getIntentSlippageError = (slippageBps: number) =>
  !Number.isInteger(slippageBps) || slippageBps < 0 || slippageBps > 9999
    ? "Choose a slippage tolerance."
    : null;

export const formatBps = (bps: number) =>
  `${new BigNumber(bps).div(100).toFormat()}%`;
