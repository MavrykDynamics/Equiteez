import { describe, expect, it } from "vitest";

import type { OrderbookDepthResponseType } from "~/lib/apis/rwa/orderbookDepth/orderbookDepth.types";
import type { OrderBookRow } from "~/lib/organisms/OrderBookPopup/orderBook.types";

import {
  createOrderBookDataFromDepth,
  getOrderbookDepthSummaryQuoteTotals,
  getOrderBookPrecisionOptionsFromDepth,
  getSpread,
  getTotalOrderBookDepthLiquidity,
} from "./orderBook.consts";

// Minimal row factory - getSpread only reads `price`. Asks are ordered so the
// last element is the best (lowest) ask; bids so the first is the best (highest)
// bid, matching how createOrderBookData feeds them in.
const row = (
  price: number,
  overrides: Partial<OrderBookRow> = {}
): OrderBookRow => ({
  amount: 0,
  depthPercentage: 0,
  id: `row-${price}`,
  isMarketOrder: false,
  price,
  total: 0,
  ...overrides,
});

const makeOrderbookDepth = (
  overrides: Partial<OrderbookDepthResponseType> = {}
): OrderbookDepthResponseType => ({
  asks: [],
  best_ask: 0,
  best_bid: 0,
  bids: [],
  generated_at: "2026-08-04T10:44:45.362Z",
  orderbook_address: "KT1orderbook",
  quote_token: {
    address: "KT1quote",
    decimals: 6,
    symbol: "USDT",
    token_id: 0,
  },
  spread: 0,
  token_address: "KT1rwa",
  totals: {
    ask_volume: 0,
    bid_volume: 0,
    buy_ratio_pct: 0,
    ratio_depth: 0,
    sell_ratio_pct: 0,
  },
  ...overrides,
});

describe("getSpread", () => {
  it("computes best ask, best bid and the spread value when both sides exist", () => {
    const asks = [row(7), row(6), row(5)]; // best ask (last) = 5
    const bids = [row(4), row(3), row(2)]; // best bid (first) = 4

    expect(getSpread(asks, bids)).toEqual({
      bestAsk: 5,
      bestBid: 4,
      price: 5,
      value: 1,
    });
  });

  // The QA screenshot: asks present (5..7), no bids -> quote the best ask, and
  // the spread value collapses to 0 rather than a bogus number.
  it("quotes the best ask and zero spread when there are no bids", () => {
    const asks = [row(7), row(6), row(5)];

    expect(getSpread(asks, [])).toEqual({
      bestAsk: 5,
      bestBid: 0,
      price: 5,
      value: 0,
    });
  });

  it("quotes the best bid and zero spread when there are no asks", () => {
    const bids = [row(4), row(3), row(2)];

    expect(getSpread([], bids)).toEqual({
      bestAsk: 0,
      bestBid: 4,
      price: 4,
      value: 0,
    });
  });

  it("returns all zeros for an empty book", () => {
    expect(getSpread([], [])).toEqual({
      bestAsk: 0,
      bestBid: 0,
      price: 0,
      value: 0,
    });
  });

  it("ignores market rows when computing best prices and spread", () => {
    const asks = [row(7), row(5), row(0, { isMarketOrder: true })];
    const bids = [row(999_999_999_999, { isMarketOrder: true }), row(4)];

    expect(getSpread(asks, bids)).toEqual({
      bestAsk: 5,
      bestBid: 4,
      price: 5,
      value: 1,
    });
  });
});

describe("createOrderBookDataFromDepth", () => {
  it("groups depth levels with ask-ceil and bid-floor price rounding", () => {
    const depth = makeOrderbookDepth({
      asks: [
        { amount: 1, orders_count: 1, price: 46.01, total_quote: 46.01 },
        { amount: 2, orders_count: 1, price: 46.09, total_quote: 92.18 },
      ],
      bids: [
        { amount: 1, orders_count: 1, price: 45.91, total_quote: 45.91 },
        { amount: 2, orders_count: 1, price: 45.95, total_quote: 91.9 },
      ],
    });
    const data = createOrderBookDataFromDepth({
      baseTokenSymbol: "RWA",
      orderbookDepth: depth,
      priceGroupingPrecision: 0.1,
      quoteTokenSymbol: "USDT",
    });

    expect(data.asks).toEqual([
      {
        amount: 3,
        depthPercentage: 100,
        id: "ask-46.1",
        isMarketOrder: false,
        price: 46.1,
        total: 138.19,
      },
    ]);
    expect(data.bids).toEqual([
      {
        amount: 3,
        depthPercentage: 100,
        id: "bid-45.9",
        isMarketOrder: false,
        price: 45.9,
        total: 137.81,
      },
    ]);
    expect(data.spread).toEqual({
      bestAsk: 46.1,
      bestBid: 45.9,
      price: 46.1,
      value: 0.2,
    });
  });

  it("derives grouping options from depth prices", () => {
    const depth = makeOrderbookDepth({
      asks: [{ amount: 1, orders_count: 1, price: 46.1234, total_quote: 46 }],
      bids: [{ amount: 1, orders_count: 1, price: 45.12, total_quote: 45 }],
    });

    expect(
      getOrderBookPrecisionOptionsFromDepth({
        orderbookDepth: depth,
        quoteTokenDecimals: 6,
      })
    ).toEqual([0.0001, 0.001, 0.01, 0.1]);
  });
});

describe("orderbook depth liquidity helpers", () => {
  it("sums top depth rows by quote value for the footer summary", () => {
    const depth = makeOrderbookDepth({
      asks: [
        { amount: 1, orders_count: 1, price: 46, total_quote: 20 },
        { amount: 1, orders_count: 1, price: 47, total_quote: 30 },
      ],
      bids: [
        { amount: 1, orders_count: 1, price: 45, total_quote: 100 },
        { amount: 1, orders_count: 1, price: 44, total_quote: 10 },
      ],
    });

    const totals = getOrderbookDepthSummaryQuoteTotals({
      orderbookDepth: depth,
      sampleSize: 1,
    });

    expect(totals.buyTotal.toNumber()).toBe(100);
    expect(totals.sellTotal.toNumber()).toBe(20);
  });

  it("sums fetched bid and ask quote totals for liquidity", () => {
    const depth = makeOrderbookDepth({
      asks: [{ amount: 1, orders_count: 1, price: 46, total_quote: 20 }],
      bids: [{ amount: 1, orders_count: 1, price: 45, total_quote: 100 }],
    });

    expect(getTotalOrderBookDepthLiquidity(depth).toNumber()).toBe(120);
    expect(getTotalOrderBookDepthLiquidity(null).toNumber()).toBe(0);
  });
});
