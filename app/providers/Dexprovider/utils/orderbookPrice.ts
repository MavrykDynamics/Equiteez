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
