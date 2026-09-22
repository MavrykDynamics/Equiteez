import { describe, expect, it } from "vitest";

import { AssetSchema } from "./assets.schema";

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
