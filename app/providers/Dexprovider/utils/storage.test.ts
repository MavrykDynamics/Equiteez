import { describe, expect, it } from "vitest";

import { OrderbooksListSchema } from "~/providers/Dexprovider/schemas/orderbook.schema";
import type { OrderbooksList } from "~/providers/Dexprovider/schemas/orderbook.schema";
import type { OrderbookConfigType } from "~/providers/MarketsProvider/market.types";

import { getOrderbookStorages, resolveOrderbookTickSize } from "./storage";

const orderbookAddress = "KT1orderbook";
const rwaTokenAddress = "KT1rwa";

const makeOrderbookItem = (
  overrides: Partial<OrderbooksList[number]> = {}
): OrderbooksList[number] => ({
  address: orderbookAddress,
  last_matched_price: 0,
  lowest_sell_price: 1_000_000,
  highest_buy_price: 900_000,
  sell_order_fee: 0,
  buy_order_fee: 0,
  quote_token: {
    address: "KT1quote",
    token_id: 0,
    symbol: "USDT",
    decimals: 6,
  },
  ...overrides,
});

const orderbookConfig: OrderbookConfigType = {
  address: orderbookAddress,
  rwaTokenAddress,
  rwaTokenId: "0",
  rwaTokenDecimals: 6,
  currencies: [
    {
      currencyKey: "USD",
      token: {
        address: "KT1quote",
        token_id: "0",
        decimals: 6,
        symbol: "USDT",
      },
    },
  ],
};

describe("OrderbooksListSchema", () => {
  it("keeps camel-case tick sizes from the API payload", () => {
    const [item] = OrderbooksListSchema.parse([
      makeOrderbookItem({ tickSize: 100_000 }),
    ]);

    expect(item.tickSize).toBe(100_000);
  });

  it("keeps snake-case tick sizes from the API payload", () => {
    const [item] = OrderbooksListSchema.parse([
      makeOrderbookItem({ tick_size: 100_000 }),
    ]);

    expect(item.tick_size).toBe(100_000);
  });
});

describe("resolveOrderbookTickSize", () => {
  it("uses the API tick size before the contract-view fallback", () => {
    expect(
      resolveOrderbookTickSize(makeOrderbookItem({ tickSize: 100_000 }), {
        [orderbookAddress]: 10_000,
      })
    ).toBe(100_000);
  });

  it("falls back to the contract-view tick size when the API omits it", () => {
    expect(
      resolveOrderbookTickSize(makeOrderbookItem(), {
        [orderbookAddress]: 10_000,
      })
    ).toBe(10_000);
  });
});

describe("getOrderbookStorages", () => {
  it("stores orderbook data when the REST payload has tickSize and fallback map is empty", () => {
    const storages = getOrderbookStorages(
      [makeOrderbookItem({ tickSize: 100_000 })],
      new Map([[orderbookAddress, orderbookConfig]]),
      {}
    );

    expect(Object.values(storages)).toHaveLength(1);
    expect(Object.values(storages)[0].tickSize).toBe(100_000);
  });
});
