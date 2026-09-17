import { describe, expect, it } from "vitest";

import { OrderbookDepthSchema } from "./orderbookDepth.schema";

const makeOrderbookDepthResponse = (
  overrides: Record<string, unknown> = {}
) => ({
  asks: [],
  best_ask: 0,
  best_bid: 0,
  bids: [],
  generated_at: "2026-08-10T09:18:30.844496774Z",
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
    ratio_depth: 1,
    sell_ratio_pct: 100,
  },
  ...overrides,
});

describe("OrderbookDepthSchema", () => {
  it("normalizes null sides to empty arrays", () => {
    const parsed = OrderbookDepthSchema.parse(
      makeOrderbookDepthResponse({
        asks: null,
        bids: null,
      })
    );

    expect(parsed.asks).toEqual([]);
    expect(parsed.bids).toEqual([]);
  });
});
