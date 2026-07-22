// eslint-disable-next-line import/no-named-as-default
import BigNumber from "bignumber.js";

import type { OpenOrder } from "~/lib/apis/mbrwa/openOrders/openOrders.schema";
import { atomsToTokens } from "~/lib/utils/formaters";
import {
  getQuoteValueAtomsForOrder,
  isMarketOrderPrice,
} from "~/providers/Dexprovider/utils";

export type OrderBookDepthSide = "ask" | "bid";

export type AggregatedOrderBookDepthLevel = {
  amount: BigNumber;
  amountAtoms: BigNumber;
  id: string;
  isMarketOrder: boolean;
  price: BigNumber;
  priceTickAtoms: BigNumber;
  total: BigNumber;
  totalAtoms: BigNumber;
};

type AggregateOrderBookDepthLevelsParams = {
  baseTokenDecimals: number;
  orders: OpenOrder[];
  quoteTokenDecimals: number;
  rawTickSize?: BigNumber.Value;
  side: OrderBookDepthSide;
};

type GetNormalizedPriceTickAtomsParams = {
  priceAtoms: BigNumber.Value;
  rawTickSize?: BigNumber.Value;
  side: OrderBookDepthSide;
};

type GetRemainingQuoteValueAtomsParams = {
  baseTokenDecimals: number;
  isMarketOrder: boolean;
  order: OpenOrder;
  priceTickAtoms: BigNumber.Value;
};

type DepthAccumulator = {
  amountAtoms: BigNumber;
  isMarketOrder: boolean;
  priceTickAtoms: BigNumber;
  totalAtoms: BigNumber;
};

const toOrderSide = (side: OrderBookDepthSide) =>
  side === "bid" ? "buy" : "sell";

const getPriceGroupingMode = (side: OrderBookDepthSide) =>
  side === "ask" ? BigNumber.ROUND_CEIL : BigNumber.ROUND_FLOOR;

export const getNormalizedPriceTickAtoms = ({
  priceAtoms,
  rawTickSize,
  side,
}: GetNormalizedPriceTickAtomsParams): BigNumber => {
  const price = new BigNumber(priceAtoms).integerValue(BigNumber.ROUND_DOWN);
  const tickSize = new BigNumber(rawTickSize ?? 0);

  if (
    !price.isFinite() ||
    !price.isInteger() ||
    !tickSize.isFinite() ||
    !tickSize.isInteger() ||
    tickSize.lte(0)
  ) {
    return price;
  }

  return price
    .div(tickSize)
    .integerValue(getPriceGroupingMode(side))
    .times(tickSize);
};

export const getRemainingQuoteValueAtoms = ({
  baseTokenDecimals,
  isMarketOrder,
  order,
  priceTickAtoms,
}: GetRemainingQuoteValueAtomsParams): BigNumber => {
  if (isMarketOrder) {
    return new BigNumber(order.total_usd_value_of_rwa_token_amount)
      .integerValue(BigNumber.ROUND_DOWN);
  }

  return getQuoteValueAtomsForOrder({
    tokenAmountAtoms: order.unfulfilled_amount,
    pricePerTokenAtoms: priceTickAtoms,
    baseTokenDecimals,
  });
};

export const aggregateOrderBookDepthLevels = ({
  baseTokenDecimals,
  orders,
  quoteTokenDecimals,
  rawTickSize,
  side,
}: AggregateOrderBookDepthLevelsParams): AggregatedOrderBookDepthLevel[] => {
  const levelsByPriceTick = orders.reduce<Map<string, DepthAccumulator>>(
    (levels, order) => {
      const isMarketOrder = isMarketOrderPrice(order, toOrderSide(side));
      const priceTickAtoms = getNormalizedPriceTickAtoms({
        priceAtoms: order.price_per_rwa_token,
        rawTickSize,
        side,
      });
      const priceTickKey = priceTickAtoms.toFixed(0);
      const levelKey = `${isMarketOrder ? "market" : "limit"}-${priceTickKey}`;
      const amountAtoms = new BigNumber(order.unfulfilled_amount)
        .integerValue(BigNumber.ROUND_DOWN);
      const totalAtoms = getRemainingQuoteValueAtoms({
        baseTokenDecimals,
        isMarketOrder,
        order,
        priceTickAtoms,
      });
      const currentLevel = levels.get(levelKey);

      if (!currentLevel) {
        levels.set(levelKey, {
          amountAtoms,
          isMarketOrder,
          priceTickAtoms,
          totalAtoms,
        });

        return levels;
      }

      currentLevel.amountAtoms = currentLevel.amountAtoms.plus(amountAtoms);
      currentLevel.totalAtoms = currentLevel.totalAtoms.plus(totalAtoms);

      return levels;
    },
    new Map()
  );

  return Array.from(levelsByPriceTick.values())
    .sort((left, right) => {
      const priceDifference = left.priceTickAtoms.minus(right.priceTickAtoms);

      if (priceDifference.isZero()) return 0;

      if (side === "bid") {
        return priceDifference.isPositive() ? -1 : 1;
      }

      return priceDifference.isPositive() ? 1 : -1;
    })
    .map((level) => ({
      amount: atomsToTokens(level.amountAtoms, baseTokenDecimals),
      amountAtoms: level.amountAtoms,
      id: `${side}-${level.isMarketOrder ? "market" : "tick"}-${level.priceTickAtoms.toFixed(0)}`,
      isMarketOrder: level.isMarketOrder,
      price: atomsToTokens(level.priceTickAtoms, quoteTokenDecimals),
      priceTickAtoms: level.priceTickAtoms,
      total: atomsToTokens(level.totalAtoms, quoteTokenDecimals),
      totalAtoms: level.totalAtoms,
    }));
};
