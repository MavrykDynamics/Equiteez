// eslint-disable-next-line import/no-named-as-default
import BigNumber from "bignumber.js";
import type { OpenOrder } from "~/lib/apis/mbrwa/openOrders/openOrders.schema";
import type {
  OrderBookData,
  OrderBookRow,
} from "~/lib/organisms/OrderBookPopup/orderBook.types";
import { atomsToTokens } from "~/lib/utils/formaters";

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

const sortRowsByPriceDesc = (rows: OrderBookRow[]) =>
  [...rows].sort((left, right) => right.price - left.price);

const withDepthPercentages = (rows: OrderBookRow[]) => {
  const maxTotal = rows.reduce(
    (currentMax, row) => Math.max(currentMax, row.total),
    0
  );

  return rows.map((row) => ({
    ...row,
    depthPercentage: getDepthPercentage(row.total, maxTotal),
  }));
};

const getGroupedPriceLevel = (
  price: BigNumber,
  groupingPrecision: BigNumber,
  side: OrderBookSide
) => {
  const roundingMode =
    side === "ask" ? BigNumber.ROUND_CEIL : BigNumber.ROUND_FLOOR;

  return price
    .div(groupingPrecision)
    .integerValue(roundingMode)
    .multipliedBy(groupingPrecision);
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

        return {
          amount: amount.toNumber(),
          depthPercentage: 0,
          id: `${side}-${order.id}`,
          price: groupedPrice.toNumber(),
          total: amount.multipliedBy(price).toNumber(),
        };
      })
    )
  );
};

const getSpread = (
  asks: OrderBookRow[],
  bids: OrderBookRow[]
): OrderBookData["spread"] => {
  const bestAsk = asks.at(-1)?.price ?? 0;
  const bestBid = bids[0]?.price ?? 0;

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

export const getOrderBookPrecisionOptions = ({
  buyOrders,
  quoteTokenDecimals,
  sellOrders,
}: GetOrderBookPrecisionOptionsParams) => {
  const orders = [...buyOrders, ...sellOrders];
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
