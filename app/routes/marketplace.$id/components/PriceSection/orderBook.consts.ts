// eslint-disable-next-line import/no-named-as-default
import BigNumber from "bignumber.js";
import type { OpenOrder } from "~/lib/apis/mbrwa/openOrders/openOrders.schema";
import {
  aggregateOrderBookDepthLevels,
  getNormalizedPriceTickAtoms,
  getRemainingQuoteValueAtoms,
  type OrderBookDepthSide,
} from "~/lib/orderbook/orderBookDepth";
import type {
  OrderBookData,
  OrderBookRow,
} from "~/lib/organisms/OrderBookPopup/orderBook.types";
import { atomsToTokens } from "~/lib/utils/formaters";
import { isMarketOrderPrice } from "~/providers/Dexprovider/utils";

const DEFAULT_QUOTE_TOKEN_SYMBOL = "USDT";
const MAX_GROUPING_OPTIONS = 4;
const MAX_GROUPING_PRECISION_FRACTION_DIGITS = 4;
export const DEFAULT_ORDER_BOOK_GROUPING_PRECISION = 0.01;

type CreateOrderBookDataParams = {
  baseTokenDecimals: number;
  baseTokenSymbol: string;
  buyOrders: OpenOrder[];
  quoteTokenDecimals: number;
  quoteTokenSymbol?: string;
  rawTickSize?: BigNumber.Value;
  sellOrders: OpenOrder[];
};

type CreateDefaultOrderBookDataParams = {
  baseTokenSymbol: string;
  quoteTokenSymbol?: string;
};

type GetOrderBookPrecisionOptionsParams = {
  buyOrders: OpenOrder[];
  quoteTokenDecimals: number;
  sellOrders: OpenOrder[];
};

const getDepthPercentage = (value: number, maxValue: number) => {
  if (maxValue === 0) return 0;

  return Number(((value / maxValue) * 100).toFixed(2));
};

const getFractionDigits = (value: BigNumber.Value) => {
  const fractionPart = new BigNumber(value).toFixed().split(".")[1];

  if (!fractionPart) return 0;

  return fractionPart.replace(/0+$/, "").length;
};

const getPrecisionValue = (fractionDigits: number) =>
  new BigNumber(1).div(new BigNumber(10).pow(fractionDigits)).toNumber();

const withDepthPercentages = (rows: OrderBookRow[]) => {
  const maxTotal = rows.filter((row) => !row.isMarketOrder).reduce(
    (currentMax, row) => Math.max(currentMax, row.total),
    0
  );

  return rows.map((row) => ({
    ...row,
    depthPercentage: row.isMarketOrder
      ? 0
      : getDepthPercentage(row.total, maxTotal),
  }));
};

const toOrderBookRows = (
  orders: OpenOrder[],
  baseTokenDecimals: number,
  quoteTokenDecimals: number,
  rawTickSize: BigNumber.Value | undefined,
  side: OrderBookDepthSide
) => {
  return withDepthPercentages(
    aggregateOrderBookDepthLevels({
      baseTokenDecimals,
      orders,
      quoteTokenDecimals,
      rawTickSize,
      side,
    }).map((level) => ({
      amount: level.amount.toNumber(),
      depthPercentage: 0,
      id: level.id,
      isMarketOrder: level.isMarketOrder,
      price: level.price.toNumber(),
      total: level.total.toNumber(),
    }))
  );
};

export const getSpread = (
  asks: OrderBookRow[],
  bids: OrderBookRow[]
): OrderBookData["spread"] => {
  const realAsks = asks.filter((row) => !row.isMarketOrder);
  const realBids = bids.filter((row) => !row.isMarketOrder);
  const bestAsk = realAsks[0]?.price ?? 0;
  const bestBid = realBids[0]?.price ?? 0;

  return {
    bestAsk,
    bestBid,
    price: bestAsk > 0 ? bestAsk : bestBid,
    value:
      bestAsk > 0 && bestBid > 0
        ? new BigNumber(bestAsk).minus(bestBid).abs().toNumber()
        : 0,
  };
};

const getSentiment = (asks: OrderBookRow[], bids: OrderBookRow[]) => {
  const askTotal = asks.reduce(
    (total, row) => total.plus(row.total),
    new BigNumber(0)
  );
  const bidTotal = bids.reduce(
    (total, row) => total.plus(row.total),
    new BigNumber(0)
  );
  const total = askTotal.plus(bidTotal);

  if (total.isZero()) {
    return {
      buy: 0,
      sell: 0,
    };
  }

  const buy = Math.round(bidTotal.div(total).times(100).toNumber());

  return {
    buy,
    sell: 100 - buy,
  };
};

type GetTotalOrderBookLiquidityParams = {
  buyOrders: OpenOrder[];
  sellOrders: OpenOrder[];
  baseTokenDecimals: number;
  quoteTokenDecimals: number;
  rawTickSize?: BigNumber.Value;
};

/**
 * Total USD value of all resting orders on both sides of the book — the real
 * liquidity available in the orderbook. Limit-order value is derived from the
 * remaining amount and normalized price tick, not the original order total.
 */
export const getTotalOrderBookLiquidity = ({
  buyOrders,
  sellOrders,
  baseTokenDecimals,
  quoteTokenDecimals,
  rawTickSize,
}: GetTotalOrderBookLiquidityParams): BigNumber => {
  const sumSide = (orders: OpenOrder[], side: OrderBookDepthSide) =>
    orders.reduce((runningTotal, order) => {
      const isMarketOrder = isMarketOrderPrice(
        order,
        side === "bid" ? "buy" : "sell"
      );

      if (isMarketOrder) return runningTotal;

      const priceTickAtoms = getNormalizedPriceTickAtoms({
        priceAtoms: order.price_per_rwa_token,
        rawTickSize,
        side,
      });
      const orderValue = atomsToTokens(
        getRemainingQuoteValueAtoms({
          baseTokenDecimals,
          isMarketOrder,
          order,
          priceTickAtoms,
        }),
        quoteTokenDecimals
      );

      return runningTotal.plus(orderValue);
    }, new BigNumber(0));

  // buyOrders are bids, sellOrders are asks.
  return sumSide(buyOrders, "bid").plus(sumSide(sellOrders, "ask"));
};

export const getOrderBookPrecisionOptions = ({
  buyOrders,
  quoteTokenDecimals,
  sellOrders,
}: GetOrderBookPrecisionOptionsParams) => {
  // Exclude market orders - their sentinel price would otherwise skew the
  // computed grouping precision.
  const realBuyOrders = buyOrders.filter(
    (order) => !isMarketOrderPrice(order, "buy")
  );
  const realSellOrders = sellOrders.filter(
    (order) => !isMarketOrderPrice(order, "sell")
  );
  const orders = [...realBuyOrders, ...realSellOrders];
  const fallbackFractionDigits = Math.min(quoteTokenDecimals, 2);
  const startFractionDigits =
    orders.length === 0
      ? fallbackFractionDigits
      : Math.min(
          orders.reduce((currentMax, order) => {
            const price = atomsToTokens(
              order.price_per_rwa_token,
              quoteTokenDecimals
            );

            return Math.max(currentMax, getFractionDigits(price));
          }, 0),
          MAX_GROUPING_PRECISION_FRACTION_DIGITS
        );

  return Array.from(
    new Set(
      [
        startFractionDigits,
        startFractionDigits - 1,
        startFractionDigits - 2,
        startFractionDigits - 3,
        0,
      ].filter((digits) => digits >= 0)
    )
  )
    .slice(0, MAX_GROUPING_OPTIONS)
    .map(getPrecisionValue);
};

export const createDefaultOrderBookData = ({
  baseTokenSymbol,
  quoteTokenSymbol = DEFAULT_QUOTE_TOKEN_SYMBOL,
}: CreateDefaultOrderBookDataParams): OrderBookData => ({
  title: "Order Book",
  toggleLabels: {
    hide: "Hide Order Book",
    show: "Show Order Book",
  },
  headers: {
    amount: `Amount (${baseTokenSymbol})`,
    price: `Price (${quoteTokenSymbol})`,
    total: `Total (${quoteTokenSymbol})`,
  },
  asks: [],
  bids: [],
  sentiment: {
    buy: 0,
    sell: 0,
  },
  spread: {
    bestAsk: 0,
    bestBid: 0,
    price: 0,
    value: 0,
  },
});

export const createOrderBookData = ({
  baseTokenDecimals,
  baseTokenSymbol,
  buyOrders,
  quoteTokenDecimals,
  quoteTokenSymbol = DEFAULT_QUOTE_TOKEN_SYMBOL,
  rawTickSize,
  sellOrders,
}: CreateOrderBookDataParams): OrderBookData => {
  const asks = toOrderBookRows(
    sellOrders,
    baseTokenDecimals,
    quoteTokenDecimals,
    rawTickSize,
    "ask"
  );
  const bids = toOrderBookRows(
    buyOrders,
    baseTokenDecimals,
    quoteTokenDecimals,
    rawTickSize,
    "bid"
  );

  return {
    ...createDefaultOrderBookData({
      baseTokenSymbol,
      quoteTokenSymbol,
    }),
    asks,
    bids,
    sentiment: getSentiment(asks, bids),
    spread: getSpread(asks, bids),
  };
};
