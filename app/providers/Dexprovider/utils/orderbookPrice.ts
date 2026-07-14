import BigNumber from "bignumber.js";
import { atomsToTokens } from "~/lib/utils/formaters";

export const getBestBuyPrice = (rawSellPrices: number[]): BigNumber => {
  if (!rawSellPrices.length) return new BigNumber(0);
  return BigNumber.min(...rawSellPrices.map((p) => new BigNumber(p)));
};

export const getBestSellPrice = (rawBuyPrices: number[]): BigNumber => {
  if (!rawBuyPrices.length) return new BigNumber(0);
  return BigNumber.max(...rawBuyPrices.map((p) => new BigNumber(p)));
};

export type OrderBookPriceType = {
  address: string;
  marketBuyPrice: BigNumber;
  marketSellPrice: BigNumber;
};

export const getOrderBookPricesPerToken = (
  address: string,
  rawBuyPrices: number[],
  rawSellPrices: number[]
): OrderBookPriceType => {
  return {
    address,
    marketBuyPrice: getBestBuyPrice(rawSellPrices), // cheapest sell
    marketSellPrice: getBestSellPrice(rawBuyPrices), // highest bid
  };
};

// Sentinel prices used on-chain for market orders (mirror
// marketBuyProtectedPrice/marketSellProtectedPrice); they are not real prices.
export const MARKET_BUY_SENTINEL_PRICE = 999_999_999_999;
export const MARKET_SELL_SENTINEL_PRICE = 0;

export type BestOpenOrderPrices = {
  lowestSellPrice: number;
  highestBuyPrice: number;
  hasAskLiquidity: boolean;
  hasBidLiquidity: boolean;
};

// Orderbook Market logic
// The contract ignores whatever price a market order is submitted with - it
// overwrites it with a protected sentinel price so the order always matches
// first (see marketBuyProtectedPrice/marketSellProtectedPrice in
// rwaOrderbookLambdas.ligo). So the front end has no execution price to
// protect here; it should just show the real current price, same as a CEX
// market order quote: best ask for a buy, best bid for a sell.
export function getMarketBuyPrice(
  lowestSellPrice: number,
  quoteTokenDecimals: number
): BigNumber {
  return atomsToTokens(lowestSellPrice, quoteTokenDecimals);
}

export function getMarketSellPrice(
  highestBuyPrice: number,
  quoteTokenDecimals: number
): BigNumber {
  return atomsToTokens(highestBuyPrice, quoteTokenDecimals);
}

/**
 * Resolve the market price to quote for a market order.
 *
 * Prefer the natural side of the book (best ask for a buy, best bid for a
 * sell). When that side is empty, fall back to the opposite side's real price
 * so the two sides stay correlated — e.g. a market sell with no bids quotes the
 * best ask instead of a placeholder. Returns 0 only when the book has no orders
 * on either side.
 */
export function resolveMarketPrice(
  isBuyOrder: boolean,
  lowestSellPrice: number,
  highestBuyPrice: number,
  quoteTokenDecimals: number
): BigNumber {
  const marketBuyPrice = getMarketBuyPrice(lowestSellPrice, quoteTokenDecimals);
  const marketSellPrice = getMarketSellPrice(
    highestBuyPrice,
    quoteTokenDecimals
  );

  const primaryPrice = isBuyOrder ? marketBuyPrice : marketSellPrice;
  const fallbackPrice = isBuyOrder ? marketSellPrice : marketBuyPrice;

  const isUsable = (price: BigNumber) => price.isFinite() && price.gt(0);

  if (isUsable(primaryPrice)) return primaryPrice;
  if (isUsable(fallbackPrice)) return fallbackPrice;

  return new BigNumber(0);
}

/**
 * Convert a quote amount into a token quantity at a market price, guarding
 * against an empty-book price of 0 (resolveMarketPrice returns 0 when the book
 * has no orders on either side). A raw amount.div(0) yields Infinity, which is
 * truthy and slips past `|| undefined` / `?? 0`, rendering "∞" in the UI.
 * Returns undefined when the amount is missing or the price is not positive.
 */
export function safeDivByPrice(
  amount: BigNumber | undefined,
  price: BigNumber
): BigNumber | undefined {
  return amount && price.gt(0) ? amount.div(price) : undefined;
}

export function hasExecutableMarketPrice(
  isBuyOrder: boolean,
  { hasAskLiquidity, hasBidLiquidity }: BestOpenOrderPrices
): boolean {
  return isBuyOrder ? hasAskLiquidity : hasBidLiquidity;
}

export function alignLimitPriceToTick({
  isBuyOrder,
  price,
  quoteTokenDecimals,
  tickSize,
}: {
  isBuyOrder: boolean;
  price: BigNumber | undefined;
  quoteTokenDecimals: number;
  tickSize: number;
}): BigNumber | undefined {
  if (!price) return undefined;
  if (!price.isFinite() || price.lte(0)) return price;

  const tickPrice = atomsToTokens(tickSize, quoteTokenDecimals);

  if (!tickPrice.isFinite() || tickPrice.lte(0)) return price;

  return price
    .div(tickPrice)
    .integerValue(isBuyOrder ? BigNumber.ROUND_FLOOR : BigNumber.ROUND_CEIL)
    .multipliedBy(tickPrice);
}

/**
 * Token quantity that a percentage of a quote-token balance can buy at a given
 * per-token price. Returns undefined when the price is not positive (can't size
 * a buy without a price). Used by the limit-buy percentage selector.
 */
export function deriveQuantityFromPercent(
  balance: BigNumber.Value,
  percent: BigNumber.Value,
  pricePerToken: BigNumber
): BigNumber | undefined {
  const spend = new BigNumber(balance).times(percent).div(100);
  return safeDivByPrice(spend, pricePerToken);
}

/**
 * Side-aware balance check: a BUY overspends when the quote total exceeds the
 * quote balance; a SELL oversells when the token amount exceeds the token
 * balance. Returns a real boolean — a BigNumber NaN or undefined resolves to
 * false (BigNumber NaN comparisons are false), so callers get a safe guard.
 */
export function exceedsAvailableBalance({
  isBuyAction,
  total,
  amount,
  usdBalance,
  tokenBalance,
}: {
  isBuyAction: boolean;
  total: BigNumber | undefined;
  amount: BigNumber | undefined;
  usdBalance: BigNumber.Value;
  tokenBalance: BigNumber.Value;
}): boolean {
  return isBuyAction
    ? Boolean(total?.gt(usdBalance))
    : Boolean(amount?.gt(tokenBalance));
}

/**
 * Best ask (lowest real sell price) and best bid (highest real buy price) from
 * the LIVE open orders, excluding sentinel-priced market orders. Returned in
 * raw atom units so they can feed resolveMarketPrice exactly like the
 * orderbookStorages fields do. Using this instead of the 30s-polled REST
 * snapshot keeps the displayed price consistent with the visible order book.
 */
export function getBestPricesFromOpenOrders(
  buyOrders: { price_per_rwa_token: number }[],
  sellOrders: { price_per_rwa_token: number }[]
): BestOpenOrderPrices {
  const realSellPrices = sellOrders
    .map((order) => order.price_per_rwa_token)
    .filter((price) => price > 0 && price !== MARKET_SELL_SENTINEL_PRICE);

  const realBuyPrices = buyOrders
    .map((order) => order.price_per_rwa_token)
    .filter((price) => price > 0 && price !== MARKET_BUY_SENTINEL_PRICE);

  return {
    lowestSellPrice: realSellPrices.length ? Math.min(...realSellPrices) : 0,
    highestBuyPrice: realBuyPrices.length ? Math.max(...realBuyPrices) : 0,
    hasAskLiquidity: realSellPrices.length > 0,
    hasBidLiquidity: realBuyPrices.length > 0,
  };
}
