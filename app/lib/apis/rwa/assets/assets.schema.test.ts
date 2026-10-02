import { describe, expect, it } from "vitest";

import { AssetHighlightSchema, AssetSchema } from "./assets.schema";

const currencyAmount = {
  timestamp: "2026-09-22T14:39:56Z",
  usd: 0,
  eur: 0,
  btc: 0,
  eth: 0,
  jpy: 0,
  cny: 0,
  krw: 0,
  gbp: 0,
  rub: 0,
  aed: 0,
};

const stats = {
  symbol: "XAUG",
  price: currencyAmount,
  fdv: currencyAmount,
  total_supply: "50000",
  updated_at: 1790088480,
};

describe("asset statistics", () => {
  it("accepts omitted circulation statistics without inventing values", () => {
    const parsed = AssetSchema.shape.stats.parse(stats);

    expect(parsed).not.toHaveProperty("market_cap");
    expect(parsed).not.toHaveProperty("circulating_supply");
  });

  it("preserves reported zero circulation statistics", () => {
    const parsed = AssetSchema.shape.stats.parse({
      ...stats,
      market_cap: currencyAmount,
      circulating_supply: "0",
    });

    expect(parsed?.market_cap?.usd).toBe(0);
    expect(parsed?.circulating_supply).toBe("0");
  });

  it.each([
    { market_cap: {} },
    { market_cap: null },
    { circulating_supply: 0 },
    { circulating_supply: null },
  ])("rejects malformed supplied statistics: %j", (invalidStats) => {
    expect(
      AssetSchema.shape.stats.safeParse({ ...stats, ...invalidStats }).success
    ).toBe(false);
  });
});

describe("asset highlights", () => {
  it("accepts highlights without quote price", () => {
    const parsed = AssetHighlightSchema.parse({
      address: "KT1asset",
      symbol: "rwa-usdt",
      name: "RWA Token",
      market_type: "secondary",
      price: currencyAmount,
      change_24h: null,
      listed_at: "2026-09-22T14:39:56Z",
    });

    expect(parsed).not.toHaveProperty("quote_price");
  });
});

describe("assets without published prices", () => {
  const finance = { total_dividends_distributed: "0", decimals: 6 };
  const highlight = {
    address: "KT1asset",
    symbol: "USTB",
    name: "US Treasury Bill",
    market_type: "none",
    change_24h: null,
    listed_at: "2026-10-02T09:26:57.595065Z",
  };

  it("accepts the missing finance and highlight prices observed for USTB", () => {
    expect(AssetSchema.shape.finance.parse(finance)).not.toHaveProperty(
      "value_per_token"
    );
    expect(AssetHighlightSchema.parse(highlight)).not.toHaveProperty("price");
  });

  it("preserves genuine zero prices", () => {
    expect(
      AssetSchema.shape.finance.parse({ ...finance, value_per_token: 0 })
        .value_per_token
    ).toBe(0);
    expect(
      AssetHighlightSchema.parse({ ...highlight, price: currencyAmount }).price
        ?.usd
    ).toBe(0);
  });

  it.each([null, "0", {}])("rejects malformed supplied prices: %j", (price) => {
    expect(
      AssetSchema.shape.finance.safeParse({
        ...finance,
        value_per_token: price,
      }).success
    ).toBe(false);
    expect(
      AssetHighlightSchema.safeParse({ ...highlight, price }).success
    ).toBe(false);
  });

  it("still requires identity fields", () => {
    expect(
      AssetHighlightSchema.safeParse({ ...highlight, address: undefined })
        .success
    ).toBe(false);
    expect(AssetSchema.shape.finance.safeParse({ decimals: 6 }).success).toBe(
      false
    );
  });
});
