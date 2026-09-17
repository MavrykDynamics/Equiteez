import { BigNumber } from "bignumber.js";
import {
  atomsToTokens,
  decimalScale,
  priceToAtoms,
} from "~/lib/utils/formaters";

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

type OrderbookDepthPriceLevel = {
  price: BigNumber.Value;
};

type OrderbookDepthPriceSource = {
  asks?: OrderbookDepthPriceLevel[];
  best_ask?: BigNumber.Value | null;
  best_bid?: BigNumber.Value | null;
  bids?: OrderbookDepthPriceLevel[];
};

const isPositiveFinitePrice = (price: BigNumber): boolean =>
  price.isFinite() && price.gt(0);

const toPositiveFiniteDepthPrice = (
  price: BigNumber.Value | null | undefined
): BigNumber | null => {
  const value = new BigNumber(price ?? 0);

  return isPositiveFinitePrice(value) ? value : null;
};

const toRealDepthPrices = (
  levels: OrderbookDepthPriceLevel[] | undefined
): BigNumber[] =>
  (levels ?? [])
    .map((level) => toPositiveFiniteDepthPrice(level.price))
    .filter((price): price is BigNumber => Boolean(price));

const getBestAskFromOrderbookDepth = (
  orderbookDepth: OrderbookDepthPriceSource | null | undefined
): BigNumber | null => {
  const explicitBestAsk = toPositiveFiniteDepthPrice(orderbookDepth?.best_ask);

  if (explicitBestAsk) return explicitBestAsk;

  const askPrices = toRealDepthPrices(orderbookDepth?.asks);

  return askPrices.length ? BigNumber.min(...askPrices) : null;
};

const getBestBidFromOrderbookDepth = (
  orderbookDepth: OrderbookDepthPriceSource | null | undefined
): BigNumber | null => {
  const explicitBestBid = toPositiveFiniteDepthPrice(orderbookDepth?.best_bid);

  if (explicitBestBid) return explicitBestBid;

  const bidPrices = toRealDepthPrices(orderbookDepth?.bids);

  return bidPrices.length ? BigNumber.max(...bidPrices) : null;
};

export function getBestLimitAskFromOrderbookDepth(
  orderbookDepth: OrderbookDepthPriceSource | null | undefined,
  quoteTokenDecimals: number
): BigNumber | null {
  const bestAsk = getBestAskFromOrderbookDepth(orderbookDepth);

  return bestAsk
    ? priceToAtoms(bestAsk, quoteTokenDecimals, BigNumber.ROUND_DOWN)
    : null;
}

export function getBestLimitBidFromOrderbookDepth(
  orderbookDepth: OrderbookDepthPriceSource | null | undefined,
  quoteTokenDecimals: number
): BigNumber | null {
  const bestBid = getBestBidFromOrderbookDepth(orderbookDepth);

  return bestBid
    ? priceToAtoms(bestBid, quoteTokenDecimals, BigNumber.ROUND_DOWN)
    : null;
}

export function getQuoteValueAtomsForOrder({
  tokenAmountAtoms,
  pricePerTokenAtoms,
  baseTokenDecimals,
  roundingMode = BigNumber.ROUND_DOWN,
}: {
  tokenAmountAtoms: BigNumber.Value;
  pricePerTokenAtoms: BigNumber.Value;
  baseTokenDecimals: number;
  roundingMode?: BigNumber.RoundingMode;
}): BigNumber {
  return new BigNumber(tokenAmountAtoms)
    .times(pricePerTokenAtoms)
    .div(decimalScale(baseTokenDecimals))
    .integerValue(roundingMode);
}

export function getMarketBuyTokenAmountAtoms({
  quoteBudget,
  quoteTokenDecimals,
  baseTokenDecimals,
  pricePerTokenAtoms,
}: {
  quoteBudget: BigNumber.Value;
  quoteTokenDecimals: number;
  baseTokenDecimals: number;
  pricePerTokenAtoms: BigNumber.Value;
}): BigNumber {
  const quoteBudgetAtoms = priceToAtoms(
    quoteBudget,
    quoteTokenDecimals,
    BigNumber.ROUND_DOWN
  );
  const priceAtoms = new BigNumber(pricePerTokenAtoms);

  if (!quoteBudgetAtoms.isFinite() || quoteBudgetAtoms.lt(0)) {
    throw new Error("Quote budget must be a non-negative finite value");
  }

  if (!priceAtoms.isFinite() || !priceAtoms.isInteger() || priceAtoms.lte(0)) {
    throw new Error("Market buy reference price must be a positive atom value");
  }

  return quoteBudgetAtoms
    .times(decimalScale(baseTokenDecimals))
    .div(priceAtoms)
    .integerValue(BigNumber.ROUND_DOWN);
}

export function getBestPricesFromOrderbookDepth(
  orderbookDepth: OrderbookDepthPriceSource | null | undefined,
  quoteTokenDecimals: number
): { lowestSellPrice: number; highestBuyPrice: number } {
  return {
    highestBuyPrice:
      getBestLimitBidFromOrderbookDepth(
        orderbookDepth,
        quoteTokenDecimals
      )?.toNumber() ?? 0,
    lowestSellPrice:
      getBestLimitAskFromOrderbookDepth(
        orderbookDepth,
        quoteTokenDecimals
      )?.toNumber() ?? 0,
  };
}
