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

const getValidTick = (tickSize: number) => {
  const tick = new BigNumber(tickSize);

  if (!tick.isFinite() || tick.isLessThanOrEqualTo(0)) {
    throw new Error("Invalid orderbook tick size");
  }

  return tick;
};

const roundUpToTick = (value: BigNumber, tickSize: number): BigNumber => {
  const tick = getValidTick(tickSize);

  return value
    .dividedBy(tick)
    .integerValue(BigNumber.ROUND_CEIL)
    .multipliedBy(tick);
};

const roundDownToTick = (value: BigNumber, tickSize: number): BigNumber => {
  const tick = getValidTick(tickSize);

  return value
    .dividedBy(tick)
    .integerValue(BigNumber.ROUND_FLOOR)
    .multipliedBy(tick);
};

// Orderbook Market logic
export function calculateMarketBuy(
  lowestSellPrice: number,
  highestBuyPrice: number,
  quoteTokenDecimals: number,
  tickSize: number,
  percentage: number = 0.25
): BigNumber {
  const refPrice =
    lowestSellPrice > highestBuyPrice
      ? toBigNumber(lowestSellPrice)
      : toBigNumber(highestBuyPrice);

  const rawBuyPrice = refPrice.multipliedBy(1 + percentage);
  const tickAlignedBuyPrice = roundUpToTick(rawBuyPrice, tickSize);

  return atomsToTokens(tickAlignedBuyPrice, quoteTokenDecimals);
}

export function calculateMarketSell(
  lowestSellPrice: number,
  highestBuyPrice: number,
  quoteTokenDecimals: number,
  tickSize: number,
  percentage: number = 0.25
): BigNumber {
  const refPrice =
    lowestSellPrice > highestBuyPrice
      ? toBigNumber(highestBuyPrice)
      : toBigNumber(lowestSellPrice);

  const rawSellPrice = refPrice.multipliedBy(1 - percentage);
  const tickAlignedSellPrice = roundDownToTick(rawSellPrice, tickSize);

  return atomsToTokens(tickAlignedSellPrice, quoteTokenDecimals);
}
