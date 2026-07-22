import { describe, expect, it } from "vitest";

import type { OpenOrder } from "~/lib/apis/mbrwa/openOrders/openOrders.schema";
import { OrderTypes } from "~/lib/apis/mbrwa/user/userOrders/order.const";

import {
  aggregateOrderBookDepthLevels,
  getNormalizedPriceTickAtoms,
} from "./orderBookDepth";

const DECIMALS = {
  baseTokenDecimals: 6,
  quoteTokenDecimals: 6,
};

const makeOrder = (
  overrides: Partial<Record<keyof OpenOrder, unknown>>
): OpenOrder =>
  ({
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
    fulfilled_amount: "0",
    orderbook_id: 1,
    price_per_rwa_token: "0",
    refunded_amount: "0",
    rwa_token_amount: "0",
    total_paid_out: "0",
    total_usd_value_of_rwa_token_amount: "0",
    unfulfilled_amount: "0",
    ...overrides,
  }) as OpenOrder;

describe("aggregateOrderBookDepthLevels", () => {
  it("groups multiple orders at the same normalized price tick", () => {
    const levels = aggregateOrderBookDepthLevels({
      orders: [
        makeOrder({
          id: 1,
          price_per_rwa_token: "25000000",
          unfulfilled_amount: "2000000",
          total_usd_value_of_rwa_token_amount: "50000000",
        }),
        makeOrder({
          id: 2,
          price_per_rwa_token: "25000000",
          unfulfilled_amount: "2000000",
          total_usd_value_of_rwa_token_amount: "50000000",
        }),
        makeOrder({
          id: 3,
          price_per_rwa_token: "25000000",
          unfulfilled_amount: "2000000",
          total_usd_value_of_rwa_token_amount: "50000000",
        }),
      ],
      rawTickSize: "10000",
      side: "bid",
      ...DECIMALS,
    });

    expect(levels).toHaveLength(1);
    expect(levels[0].priceTickAtoms.toFixed(0)).toBe("25000000");
    expect(levels[0].amount.toNumber()).toBe(6);
    expect(levels[0].total.toNumber()).toBe(150);
  });

  it("keeps different raw ticks separate even when UI formatting can match", () => {
    const levels = aggregateOrderBookDepthLevels({
      orders: [
        makeOrder({
          id: 1,
          price_per_rwa_token: "1234444",
          unfulfilled_amount: "1000000",
        }),
        makeOrder({
          id: 2,
          price_per_rwa_token: "1234445",
          unfulfilled_amount: "1000000",
        }),
      ],
      rawTickSize: "1",
      side: "bid",
      ...DECIMALS,
    });

    expect(levels).toHaveLength(2);
    expect(levels.map((level) => level.priceTickAtoms.toFixed(0))).toEqual([
      "1234445",
      "1234444",
    ]);
  });

  it("uses unfulfilled amount and recomputes remaining quote total", () => {
    const levels = aggregateOrderBookDepthLevels({
      orders: [
        makeOrder({
          price_per_rwa_token: "5000000",
          rwa_token_amount: "10000000",
          total_usd_value_of_rwa_token_amount: "50000000",
          fulfilled_amount: "6000000",
          unfulfilled_amount: "4000000",
        }),
      ],
      rawTickSize: "10000",
      side: "bid",
      ...DECIMALS,
    });

    expect(levels).toHaveLength(1);
    expect(levels[0].amount.toNumber()).toBe(4);
    expect(levels[0].total.toNumber()).toBe(20);
  });

  it("sorts buy levels by highest price first", () => {
    const levels = aggregateOrderBookDepthLevels({
      orders: [
        makeOrder({ id: 1, price_per_rwa_token: "4000000" }),
        makeOrder({ id: 2, price_per_rwa_token: "6000000" }),
        makeOrder({ id: 3, price_per_rwa_token: "5000000" }),
      ],
      rawTickSize: "10000",
      side: "bid",
      ...DECIMALS,
    });

    expect(levels.map((level) => level.price.toNumber())).toEqual([6, 5, 4]);
  });

  it("sorts sell levels by lowest price first", () => {
    const levels = aggregateOrderBookDepthLevels({
      orders: [
        makeOrder({
          id: 1,
          order_type: OrderTypes.LIMIT_SELL,
          price_per_rwa_token: "6000000",
        }),
        makeOrder({
          id: 2,
          order_type: OrderTypes.LIMIT_SELL,
          price_per_rwa_token: "4000000",
        }),
        makeOrder({
          id: 3,
          order_type: OrderTypes.LIMIT_SELL,
          price_per_rwa_token: "5000000",
        }),
      ],
      rawTickSize: "10000",
      side: "ask",
      ...DECIMALS,
    });

    expect(levels.map((level) => level.price.toNumber())).toEqual([4, 5, 6]);
  });

  it("returns an empty list for empty input", () => {
    expect(
      aggregateOrderBookDepthLevels({
        orders: [],
        rawTickSize: "10000",
        side: "bid",
        ...DECIMALS,
      })
    ).toEqual([]);
  });

  it("returns a single level for a single order", () => {
    const levels = aggregateOrderBookDepthLevels({
      orders: [
        makeOrder({
          price_per_rwa_token: "7000000",
          unfulfilled_amount: "3000000",
        }),
      ],
      rawTickSize: "10000",
      side: "bid",
      ...DECIMALS,
    });

    expect(levels).toHaveLength(1);
    expect(levels[0].price.toNumber()).toBe(7);
    expect(levels[0].amount.toNumber()).toBe(3);
    expect(levels[0].total.toNumber()).toBe(21);
  });
});

describe("getNormalizedPriceTickAtoms", () => {
  it("normalizes asks up and bids down to the contract raw tick", () => {
    expect(
      getNormalizedPriceTickAtoms({
        priceAtoms: "101",
        rawTickSize: "100",
        side: "ask",
      }).toFixed(0)
    ).toBe("200");
    expect(
      getNormalizedPriceTickAtoms({
        priceAtoms: "199",
        rawTickSize: "100",
        side: "bid",
      }).toFixed(0)
    ).toBe("100");
  });

  it("falls back to the exact raw price when tick size is missing", () => {
    expect(
      getNormalizedPriceTickAtoms({
        priceAtoms: "1234567",
        rawTickSize: "0",
        side: "bid",
      }).toFixed(0)
    ).toBe("1234567");
  });
});
