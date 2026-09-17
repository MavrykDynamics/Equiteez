import { describe, expect, it } from "vitest";
import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import type { OrderbookConfigQuery } from "~/utils/__generated__/graphql";
import {
  matchesOrderbookDepth,
  needsOrderbookContractConfig,
  normalizeNat,
  normalizeOrderbookConfig,
  normalizeTick,
} from "./orderbookConfig";
import { OrderbookDepthSchema } from "~/lib/apis/rwa/orderbookDepth/orderbookDepth.schema";

const asset = {
  address: "base",
  orderbook: {
    address: "book",
    quote_token: { address: "quote", token_id: 7, decimals: 2 },
  },
} as AssetType;
const row: OrderbookConfigQuery["orderbook"][number] = {
  address: "book",
  rwa_token: { address: "base", token_id: "19" },
  tick_size: "25",
  min_buy_order_amount: "0",
  min_buy_order_value: "90071992547409930000",
  min_sell_order_amount: "1",
  min_sell_order_value: "0",
  currencies: [
    { currency_name: "WRONG_ID", token: { address: "quote", token_id: "0" } },
    {
      currency_name: "contract-key",
      token: { address: "quote", token_id: "7" },
    },
    { currency_name: "unset", token: null },
  ],
};

describe("selected orderbook normalization", () => {
  it("uses related token IDs and matches the full quote identity", () => {
    const config = normalizeOrderbookConfig(asset, {
      ...row,
      rwa_token_id: 999,
    } as typeof row);
    expect(config).toMatchObject({
      rwaTokenId: "19",
      quoteTokenId: "7",
      currencyKey: "contract-key",
      minBuyOrderAmount: "0",
      minBuyOrderValue: "90071992547409930000",
    });
    expect(needsOrderbookContractConfig(row)).toBe(false);
  });
  it("distinguishes missing minimums from a known zero", () => {
    expect(() =>
      normalizeOrderbookConfig(asset, { ...row, min_buy_order_amount: null })
    ).toThrow();
    expect(
      needsOrderbookContractConfig({ ...row, min_buy_order_amount: null })
    ).toBe(true);
    expect(normalizeOrderbookConfig(asset, row).minBuyOrderAmount).toBe("0");
  });
  it("rejects mismatched or ambiguous identities", () => {
    expect(() =>
      normalizeOrderbookConfig(asset, { ...row, address: "previous-book" })
    ).toThrow();
    expect(() =>
      normalizeOrderbookConfig(asset, {
        ...row,
        rwa_token: { address: "previous-base", token_id: 19 },
      })
    ).toThrow();
    expect(() =>
      normalizeOrderbookConfig(asset, { ...row, currencies: [] })
    ).toThrow();
    expect(() =>
      normalizeOrderbookConfig(asset, {
        ...row,
        currencies: [...row.currencies, row.currencies[1]],
      })
    ).toThrow();
  });
  it("requires a positive integer tick, preferring API values over verified fallback", () => {
    const fallback = {
      tickSize: "50",
      minBuyOrderAmount: "2",
      minBuyOrderValue: "2",
      minSellOrderAmount: "2",
      minSellOrderValue: "2",
    };
    expect(normalizeOrderbookConfig(asset, row, fallback).tickSize).toBe("25");
    expect(
      normalizeOrderbookConfig(asset, { ...row, tick_size: null }, fallback)
        .tickSize
    ).toBe("50");
    for (const tick of [null, 0, -1, 0.5, "NaN", "Infinity"]) {
      expect(normalizeTick(tick)).toBeNull();
      expect(() =>
        normalizeOrderbookConfig(asset, { ...row, tick_size: tick })
      ).toThrow();
    }
  });
  it("preserves large atom strings and rejects already imprecise numeric data", () => {
    expect(normalizeNat("90071992547409930000")).toBe("90071992547409930000");
    expect(normalizeNat(Number("90071992547409930000"))).toBeNull();
    expect(normalizeNat(undefined)).toBeNull();
  });
  it("rejects stale depth and quote identity/decimal mismatches", () => {
    const config = normalizeOrderbookConfig(asset, row);
    const depth = OrderbookDepthSchema.parse({
      asks: [],
      bids: [],
      generated_at: "",
      orderbook_address: "book",
      token_address: "base",
      quote_token: { address: "quote", token_id: 7, decimals: 2, symbol: "Q" },
      totals: {
        ask_volume: 0,
        bid_volume: 0,
        buy_ratio_pct: 0,
        ratio_depth: 0,
        sell_ratio_pct: 0,
      },
    });
    expect(matchesOrderbookDepth(depth, config, 2)).toBe(true);
    expect(
      matchesOrderbookDepth({ ...depth, token_address: "previous" }, config, 2)
    ).toBe(false);
    expect(
      matchesOrderbookDepth(
        { ...depth, orderbook_address: "previous" },
        config,
        2
      )
    ).toBe(false);
    expect(
      matchesOrderbookDepth(
        { ...depth, quote_token: { ...depth.quote_token, token_id: 0 } },
        config,
        2
      )
    ).toBe(false);
    expect(matchesOrderbookDepth(depth, config, 6)).toBe(false);
  });
});
