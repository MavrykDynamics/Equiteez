import { describe, expect, it } from "vitest";

import type { OpenOrder } from "~/lib/apis/mbrwa/openOrders/openOrders.schema";
import type { OrderBookRow } from "~/lib/organisms/OrderBookPopup/orderBook.types";
import { OrderTypes } from "~/lib/apis/mbrwa/user/userOrders/order.const";

import { getSpread, getTotalOrderBookLiquidity } from "./orderBook.consts";

// Mirrors the sentinel prices in orderBook.consts (market orders are stored at
// these on-chain so they always match first).
const MARKET_BUY_SENTINEL_PRICE = 999_999_999_999;
const MARKET_SELL_SENTINEL_PRICE = 0;

const makeOrder = (overrides: Partial<OpenOrder>): OpenOrder => ({
  id: 1,
  orderbook: { rwa_token: { address: "KT1rwa" } },
  is_canceled: false,
  is_expired: false,
  is_fulfilled: false,
  is_refunded: false,
  order_expiry: null,
  order_id: 1,
  order_type: OrderTypes.LIMIT_BUY,
  created_at: "",
  ended_at: null,
  fulfilled_amount: 0,
  orderbook_id: 1,
  price_per_rwa_token: 0,
  refunded_amount: 0,
  rwa_token_amount: 0,
  total_paid_out: 0,
  total_usd_value_of_rwa_token_amount: 0,
  unfulfilled_amount: 0,
  ...overrides,
});

// Minimal row factory - getSpread only reads `price`. Asks are ordered so the
// last element is the best (lowest) ask; bids so the first is the best (highest)
// bid, matching how createOrderBookData feeds them in.
const row = (price: number): OrderBookRow => ({
  amount: 0,
  depthPercentage: 0,
  id: `row-${price}`,
  isMarketOrder: false,
  price,
  total: 0,
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
});

describe("getTotalOrderBookLiquidity", () => {
  const DECIMALS = { baseTokenDecimals: 6, quoteTokenDecimals: 6 };

  // 10 base tokens @ $5 = $50 of liquidity.
  const limitBid = makeOrder({
    order_type: OrderTypes.LIMIT_BUY,
    unfulfilled_amount: 10_000_000,
    price_per_rwa_token: 5_000_000,
  });

  // 4 base tokens @ $6 = $24 of liquidity.
  const limitAsk = makeOrder({
    order_type: OrderTypes.LIMIT_SELL,
    unfulfilled_amount: 4_000_000,
    price_per_rwa_token: 6_000_000,
  });

  it("sums the USD value of every resting bid and ask", () => {
    const result = getTotalOrderBookLiquidity({
      buyOrders: [limitBid],
      sellOrders: [limitAsk],
      ...DECIMALS,
    });

    expect(result.toNumber()).toBe(74); // 50 + 24
  });

  it("counts bid-side liquidity when there are no asks", () => {
    expect(
      getTotalOrderBookLiquidity({
        buyOrders: [limitBid, limitBid],
        sellOrders: [],
        ...DECIMALS,
      }).toNumber()
    ).toBe(100);
  });

  it("counts ask-side liquidity when there are no bids", () => {
    expect(
      getTotalOrderBookLiquidity({
        buyOrders: [],
        sellOrders: [limitAsk],
        ...DECIMALS,
      }).toNumber()
    ).toBe(24);
  });

  it("returns 0 for an empty book", () => {
    expect(
      getTotalOrderBookLiquidity({
        buyOrders: [],
        sellOrders: [],
        ...DECIMALS,
      }).toNumber()
    ).toBe(0);
  });

  // Sentinel-priced market orders must use their escrowed USD value, not
  // price * amount (which would be astronomical for a buy sentinel).
  it("values a market buy order by its escrowed USD, not the sentinel price", () => {
    const marketBid = makeOrder({
      order_type: OrderTypes.MARKET_BUY,
      price_per_rwa_token: MARKET_BUY_SENTINEL_PRICE,
      unfulfilled_amount: 5_000_000,
      total_usd_value_of_rwa_token_amount: 30_000_000, // $30
    });

    expect(
      getTotalOrderBookLiquidity({
        buyOrders: [marketBid],
        sellOrders: [],
        ...DECIMALS,
      }).toNumber()
    ).toBe(30);
  });

  it("values a market sell order (sentinel price 0) by its escrowed USD", () => {
    const marketAsk = makeOrder({
      order_type: OrderTypes.MARKET_SELL,
      price_per_rwa_token: MARKET_SELL_SENTINEL_PRICE,
      unfulfilled_amount: 5_000_000,
      total_usd_value_of_rwa_token_amount: 12_000_000, // $12
    });

    expect(
      getTotalOrderBookLiquidity({
        buyOrders: [],
        sellOrders: [marketAsk],
        ...DECIMALS,
      }).toNumber()
    ).toBe(12);
  });

  it("applies base and quote decimals to the correct fields", () => {
    // base has 2 decimals: raw 1000 -> 10 tokens; quote has 6: raw 5_000_000 -> $5
    const bid = makeOrder({
      unfulfilled_amount: 1000,
      price_per_rwa_token: 5_000_000,
    });

    expect(
      getTotalOrderBookLiquidity({
        buyOrders: [bid],
        sellOrders: [],
        baseTokenDecimals: 2,
        quoteTokenDecimals: 6,
      }).toNumber()
    ).toBe(50);
  });
});
