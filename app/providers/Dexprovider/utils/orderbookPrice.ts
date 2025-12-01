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

const toBigNumber = (value: number) => new BigNumber(value);

// Orderbook Market logic
export function calculateMarketBuy(
  lowestSellPrice: number,
  highestBuyPrice: number,
  decimals: number,
  percentage: number = 0.25
): BigNumber {
  const refPrice =
    lowestSellPrice > highestBuyPrice
      ? toBigNumber(lowestSellPrice)
      : toBigNumber(highestBuyPrice);

  const buyPrice = refPrice.multipliedBy(1 + percentage);

  return atomsToTokens(buyPrice.integerValue(BigNumber.ROUND_CEIL), decimals);
}

export function calculateMarketSell(
  lowestSellPrice: number,
  highestBuyPrice: number,
  decimals: number,
  percentage: number = 0.25
): BigNumber {
  const refPrice =
    lowestSellPrice > highestBuyPrice
      ? toBigNumber(highestBuyPrice)
      : toBigNumber(lowestSellPrice);

  const sellPrice = refPrice.multipliedBy(1 - percentage);

  return atomsToTokens(sellPrice.integerValue(BigNumber.ROUND_FLOOR), decimals);
}
