// eslint-disable-next-line import/no-named-as-default
import BigNumber from "bignumber.js";
import type { OpenOrder } from "~/lib/apis/mbrwa/openOrders/openOrders.schema";
import type {
  OrderbookDepthLevelType,
  OrderbookDepthResponseType,
} from "~/lib/apis/rwa/orderbookDepth/orderbookDepth.types";
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

type OrderBookSide = "ask" | "bid";

type CreateOrderBookDataParams = {
  baseTokenDecimals: number;
  baseTokenSymbol: string;
  buyOrders: OpenOrder[];
  priceGroupingPrecision: number;
  quoteTokenDecimals: number;
  quoteTokenSymbol?: string;
  sellOrders: OpenOrder[];
};

type CreateOrderBookDataFromDepthParams = {
  baseTokenSymbol: string;
  orderbookDepth: OrderbookDepthResponseType;
  priceGroupingPrecision: number;
  quoteTokenSymbol?: string;
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

type GetOrderBookPrecisionOptionsFromDepthParams = {
  orderbookDepth: OrderbookDepthResponseType | null;
  quoteTokenDecimals: number;
};

type OrderbookDepthSummaryQuoteTotalsParams = {
  orderbookDepth: OrderbookDepthResponseType | null;
  sampleSize?: number;
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

const sortRowsByPriceDesc = (rows: OrderBookRow[]) =>
  [...rows].sort((left, right) => right.price - left.price);

const sortDepthLevelsForSummary = (
  levels: OrderbookDepthLevelType[],
  side: OrderBookSide
) =>
  [...levels].sort((left, right) =>
    side === "bid" ? right.price - left.price : left.price - right.price
  );

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

const isPositiveFiniteValue = (value: BigNumber.Value) => {
  const number = new BigNumber(value);

  return number.isFinite() && number.gt(0);
};

const getGroupedPriceLevel = (
  price: BigNumber,
  groupingPrecision: BigNumber,
  side: OrderBookSide
) => {
  if (!isPositiveFiniteValue(groupingPrecision)) return price;

  const roundingMode =
    side === "ask" ? BigNumber.ROUND_CEIL : BigNumber.ROUND_FLOOR;

  return price
    .div(groupingPrecision)
    .integerValue(roundingMode)
    .multipliedBy(groupingPrecision);
};

const toDepthOrderBookRows = (
  levels: OrderbookDepthLevelType[],
  priceGroupingPrecision: number,
  side: OrderBookSide
) => {
  const groupingPrecision = new BigNumber(priceGroupingPrecision);
  const rowsByPrice = levels.reduce<
    Map<
      string,
      {
        amount: BigNumber;
        price: BigNumber;
        total: BigNumber;
      }
    >
  >((acc, level) => {
    const price = new BigNumber(level.price);

    if (!isPositiveFiniteValue(price)) return acc;

    const groupedPrice = getGroupedPriceLevel(
      price,
      groupingPrecision,
      side
    );
    const groupedPriceKey = groupedPrice.toFixed();
    const currentLevel = acc.get(groupedPriceKey) ?? {
      amount: new BigNumber(0),
      price: groupedPrice,
      total: new BigNumber(0),
    };

    acc.set(groupedPriceKey, {
      ...currentLevel,
      amount: currentLevel.amount.plus(level.amount),
      total: currentLevel.total.plus(level.total_quote),
    });

    return acc;
  }, new Map());

  return withDepthPercentages(
    sortRowsByPriceDesc(
      Array.from(rowsByPrice.values()).map((level) => ({
        amount: level.amount.toNumber(),
        depthPercentage: 0,
        id: `${side}-${level.price.toFixed()}`,
        isMarketOrder: false,
        price: level.price.toNumber(),
        total: level.total.toNumber(),
      }))
    )
  );
};

const toOrderBookRows = (
  orders: OpenOrder[],
  baseTokenDecimals: number,
  quoteTokenDecimals: number,
  priceGroupingPrecision: number,
  side: OrderBookSide
) => {
  const groupingPrecision = new BigNumber(priceGroupingPrecision);

  return withDepthPercentages(
    sortRowsByPriceDesc(
      orders.map((order) => {
        const amount = atomsToTokens(order.unfulfilled_amount, baseTokenDecimals);
        const price = atomsToTokens(
          order.price_per_rwa_token,
          quoteTokenDecimals
        );
        const groupedPrice = getGroupedPriceLevel(price, groupingPrecision, side);

        const isMarketOrder = isMarketOrderPrice(
          order,
          side === "bid" ? "buy" : "sell"
        );

        // Market orders are stored at a sentinel price, so price*amount is
        // meaningless. Use the contract's own escrow reference value instead
        // of implying a fake USDT total.
        const total = isMarketOrder
          ? atomsToTokens(
              order.total_usd_value_of_rwa_token_amount,
              quoteTokenDecimals
            ).toNumber()
          : amount.multipliedBy(price).toNumber();

        return {
          amount: amount.toNumber(),
          depthPercentage: 0,
          id: `${side}-${order.id}`,
          isMarketOrder,
          price: groupedPrice.toNumber(),
          total,
        };
      })
    )
  );
};

export const getSpread = (
  asks: OrderBookRow[],
  bids: OrderBookRow[]
): OrderBookData["spread"] => {
  const realAsks = asks.filter((row) => !row.isMarketOrder);
  const realBids = bids.filter((row) => !row.isMarketOrder);
  const bestAsk = realAsks.at(-1)?.price ?? 0;
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
};

/**
 * Total USD value of all resting orders on both sides of the book — the real
 * liquidity available in the orderbook. Each order's value is derived the same
 * way as its row total in toOrderBookRows: market/sentinel orders use their
 * escrowed USD reference value, limit orders use amount * price.
 */
export const getTotalOrderBookLiquidity = ({
  buyOrders,
  sellOrders,
  baseTokenDecimals,
  quoteTokenDecimals,
}: GetTotalOrderBookLiquidityParams): BigNumber => {
  const sumSide = (orders: OpenOrder[], side: OrderBookSide) =>
    orders.reduce((runningTotal, order) => {
      const isMarketOrder = isMarketOrderPrice(
        order,
        side === "bid" ? "buy" : "sell"
      );

      if (isMarketOrder) return runningTotal;

      const orderValue = atomsToTokens(
        order.unfulfilled_amount,
        baseTokenDecimals
      ).multipliedBy(
        atomsToTokens(order.price_per_rwa_token, quoteTokenDecimals)
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

export const getOrderBookPrecisionOptionsFromDepth = ({
  orderbookDepth,
  quoteTokenDecimals,
}: GetOrderBookPrecisionOptionsFromDepthParams) => {
  const prices = [
    ...(orderbookDepth?.bids ?? []),
    ...(orderbookDepth?.asks ?? []),
  ]
    .map((level) => level.price)
    .filter(isPositiveFiniteValue);
  const fallbackFractionDigits = Math.min(quoteTokenDecimals, 2);
  const startFractionDigits =
    prices.length === 0
      ? fallbackFractionDigits
      : Math.min(
          prices.reduce(
            (currentMax, price) =>
              Math.max(currentMax, getFractionDigits(price)),
            0
          ),
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

export const createOrderBookDataFromDepth = ({
  baseTokenSymbol,
  orderbookDepth,
  priceGroupingPrecision,
  quoteTokenSymbol = DEFAULT_QUOTE_TOKEN_SYMBOL,
}: CreateOrderBookDataFromDepthParams): OrderBookData => {
  const asks = toDepthOrderBookRows(
    orderbookDepth.asks,
    priceGroupingPrecision,
    "ask"
  );
  const bids = toDepthOrderBookRows(
    orderbookDepth.bids,
    priceGroupingPrecision,
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

export const getOrderbookDepthSummaryQuoteTotals = ({
  orderbookDepth,
  sampleSize,
}: OrderbookDepthSummaryQuoteTotalsParams) => {
  const getSideTotal = (
    levels: OrderbookDepthLevelType[],
    side: OrderBookSide
  ) =>
    sortDepthLevelsForSummary(levels, side)
      .slice(0, sampleSize)
      .reduce(
        (runningTotal, level) => runningTotal.plus(level.total_quote),
        new BigNumber(0)
      );

  return {
    buyTotal: getSideTotal(orderbookDepth?.bids ?? [], "bid"),
    sellTotal: getSideTotal(orderbookDepth?.asks ?? [], "ask"),
  };
};

export const getTotalOrderBookDepthLiquidity = (
  orderbookDepth: OrderbookDepthResponseType | null
): BigNumber => {
  const sumSide = (levels: OrderbookDepthLevelType[]) =>
    levels.reduce(
      (runningTotal, level) => runningTotal.plus(level.total_quote),
      new BigNumber(0)
    );

  return sumSide(orderbookDepth?.bids ?? []).plus(
    sumSide(orderbookDepth?.asks ?? [])
  );
};

export const createOrderBookData = ({
  baseTokenDecimals,
  baseTokenSymbol,
  buyOrders,
  priceGroupingPrecision,
  quoteTokenDecimals,
  quoteTokenSymbol = DEFAULT_QUOTE_TOKEN_SYMBOL,
  sellOrders,
}: CreateOrderBookDataParams): OrderBookData => {
  const asks = toOrderBookRows(
    sellOrders,
    baseTokenDecimals,
    quoteTokenDecimals,
    priceGroupingPrecision,
    "ask"
  );
  const bids = toOrderBookRows(
    buyOrders,
    baseTokenDecimals,
    quoteTokenDecimals,
    priceGroupingPrecision,
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
