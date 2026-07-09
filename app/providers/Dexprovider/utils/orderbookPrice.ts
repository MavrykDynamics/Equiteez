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
