import { BigNumber } from "bignumber.js";
import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import type { OrderbookDepthResponseType } from "~/lib/apis/rwa/orderbookDepth/orderbookDepth.types";
import type { OrderbookConfigQuery } from "~/utils/__generated__/graphql";
import type {
  OrderbookExecutionConfig,
  OrderbookContractConfig,
} from "./orderbookConfig.types";

// Reject unsafe JSON numbers rather than preserve already-rounded atoms/IDs.
export function normalizeNat(value: unknown): string | null {
  if (typeof value !== "string" && typeof value !== "number") return null;
  if (typeof value === "number" && !Number.isSafeInteger(value)) return null;
  if (typeof value === "string" && !/^\d+$/.test(value)) return null;
  const number = new BigNumber(value);
  return number.isFinite() && number.isInteger() && number.gte(0)
    ? number.toFixed(0)
    : null;
}

export function normalizeTick(value: unknown): string | null {
  const tick = normalizeNat(value);
  return tick !== null && new BigNumber(tick).gt(0) ? tick : null;
}

export function normalizeOrderbookConfig(
  asset: AssetType,
  row: OrderbookConfigQuery["orderbook"][number],
  fallback?: OrderbookContractConfig
): OrderbookExecutionConfig {
  const quote = asset.orderbook?.quote_token;
  if (
    !quote ||
    row.address !== asset.orderbook?.address ||
    row.rwa_token?.address !== asset.address
  ) {
    throw new Error("Orderbook identity does not match the selected asset.");
  }
  const rwaTokenId = normalizeNat(row.rwa_token.token_id);
  const quoteTokenId = normalizeNat(quote.token_id);
  const currencies = row.currencies.filter(
    ({ token }) =>
      token?.address === quote.address &&
      quoteTokenId !== null &&
      normalizeNat(token.token_id) === quoteTokenId
  );
  if (
    rwaTokenId === null ||
    quoteTokenId === null ||
    currencies.length !== 1 ||
    !currencies[0].currency_name?.trim()
  ) {
    throw new Error(
      "Orderbook token identity or quote currency is unavailable."
    );
  }
  const tickSize =
    normalizeTick(row.tick_size) ?? normalizeTick(fallback?.tickSize);
  const minBuyOrderAmount =
    normalizeNat(row.min_buy_order_amount) ??
    normalizeNat(fallback?.minBuyOrderAmount);
  const minBuyOrderValue =
    normalizeNat(row.min_buy_order_value) ??
    normalizeNat(fallback?.minBuyOrderValue);
  const minSellOrderAmount =
    normalizeNat(row.min_sell_order_amount) ??
    normalizeNat(fallback?.minSellOrderAmount);
  const minSellOrderValue =
    normalizeNat(row.min_sell_order_value) ??
    normalizeNat(fallback?.minSellOrderValue);
  if (
    tickSize === null ||
    minBuyOrderAmount === null ||
    minBuyOrderValue === null ||
    minSellOrderAmount === null ||
    minSellOrderValue === null
  ) {
    throw new Error(
      "Required orderbook tick size or minimums are unavailable."
    );
  }
  return {
    address: row.address,
    baseTokenAddress: asset.address,
    rwaTokenId,
    quoteTokenAddress: quote.address,
    quoteTokenId,
    currencyKey: currencies[0].currency_name,
    tickSize,
    minBuyOrderAmount,
    minBuyOrderValue,
    minSellOrderAmount,
    minSellOrderValue,
  };
}

export function matchesOrderbookDepth(
  depth: OrderbookDepthResponseType | null,
  config: OrderbookExecutionConfig,
  quoteDecimals: number
): boolean {
  return Boolean(
    depth &&
      depth.token_address === config.baseTokenAddress &&
      depth.orderbook_address === config.address &&
      depth.quote_token.address === config.quoteTokenAddress &&
      normalizeNat(depth.quote_token.token_id) === config.quoteTokenId &&
      depth.quote_token.decimals === quoteDecimals
  );
}

export function needsOrderbookContractConfig(
  row: OrderbookConfigQuery["orderbook"][number]
): boolean {
  return (
    normalizeTick(row.tick_size) === null ||
    [
      row.min_buy_order_amount,
      row.min_buy_order_value,
      row.min_sell_order_amount,
      row.min_sell_order_value,
    ].some((value) => normalizeNat(value) === null)
  );
}
