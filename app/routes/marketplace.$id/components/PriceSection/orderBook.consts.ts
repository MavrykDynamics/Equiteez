// eslint-disable-next-line import/no-named-as-default
import BigNumber from "bignumber.js";
import type { OpenOrder } from "~/lib/apis/mbrwa/openOrders/openOrders.schema";
import {
  OrderBookData,
  OrderBookRow,
} from "~/lib/organisms/OrderBookPopup/OrderBookPopup";
import { atomsToTokens } from "~/lib/utils/formaters";

const DEFAULT_QUOTE_TOKEN_SYMBOL = "USDT";

type CreateOrderBookDataParams = {
  baseTokenDecimals: number;
  baseTokenSymbol: string;
  buyOrders: OpenOrder[];
  quoteTokenDecimals: number;
  quoteTokenSymbol?: string;
  sellOrders: OpenOrder[];
};

type CreateDefaultOrderBookDataParams = {
  baseTokenSymbol: string;
  quoteTokenSymbol?: string;
};

const getDepthPercentage = (value: number, maxValue: number) => {
  if (maxValue === 0) return 0;

  return Number(((value / maxValue) * 100).toFixed(2));
};

const sortRowsByPriceDesc = (rows: OrderBookRow[]) =>
  [...rows].sort((left, right) => right.price - left.price);

const toOrderBookRows = (
  orders: OpenOrder[],
  baseTokenDecimals: number,
  quoteTokenDecimals: number
) => {
  const rows = sortRowsByPriceDesc(
    orders.map((order) => {
      const amount = atomsToTokens(order.unfulfilled_amount, baseTokenDecimals);
      const price = atomsToTokens(
        order.price_per_rwa_token,
        quoteTokenDecimals
      );
      const total = amount.multipliedBy(price);

      return {
        amount: amount.toNumber(),
        depthPercentage: 0,
        price: price.toNumber(),
        total: total.toNumber(),
      };
    })
  );

  const maxTotal = rows.reduce(
    (currentMax, row) => Math.max(currentMax, row.total),
    0
  );

  return rows.map((row) => ({
    ...row,
    depthPercentage: getDepthPercentage(row.total, maxTotal),
  }));
};

const getSpreadPrice = (asks: OrderBookRow[], bids: OrderBookRow[]) => {
  const bestAsk = asks.at(-1)?.price ?? 0;
  const bestBid = bids[0]?.price ?? 0;

  if (bestAsk > 0) return bestAsk;

  return bestBid;
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
    price: 0,
    referencePrice: 0,
  },
});

export const createOrderBookData = ({
  baseTokenDecimals,
  baseTokenSymbol,
  buyOrders,
  quoteTokenDecimals,
  quoteTokenSymbol = DEFAULT_QUOTE_TOKEN_SYMBOL,
  sellOrders,
}: CreateOrderBookDataParams): OrderBookData => {
  const asks = toOrderBookRows(
    sellOrders,
    baseTokenDecimals,
    quoteTokenDecimals
  );
  const bids = toOrderBookRows(
    buyOrders,
    baseTokenDecimals,
    quoteTokenDecimals
  );
  const spreadPrice = getSpreadPrice(asks, bids);

  return {
    ...createDefaultOrderBookData({
      baseTokenSymbol,
      quoteTokenSymbol,
    }),
    asks,
    bids,
    sentiment: getSentiment(asks, bids),
    spread: {
      price: spreadPrice,
      referencePrice: spreadPrice,
    },
  };
};
