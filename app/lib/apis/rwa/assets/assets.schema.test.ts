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

  it("accepts backend market cap without unrelated stats fields", () => {
    const parsed = AssetSchema.shape.stats.parse({
      market_cap: currencyAmount,
      data_quality: {
        market_cap: {
          status: "stale",
          reason: "price_stale",
          price_at: "2026-09-22T14:39:56Z",
        },
      },
    });

    expect(parsed?.market_cap?.usd).toBe(0);
    expect(parsed?.data_quality?.market_cap?.status).toBe("stale");
  });

  it("accepts quality-only stats during backend rollout", () => {
    const parsed = AssetSchema.shape.stats.parse({
      data_quality: {
        total_supply: { status: "unavailable", reason: "not_observed" },
        circulating_supply: { status: "unavailable", reason: "not_observed" },
        fdv: { status: "unavailable", reason: "not_observed" },
        market_cap: { status: "unavailable", reason: "not_observed" },
      },
    });

    expect(parsed?.data_quality?.market_cap?.reason).toBe("not_observed");
  });

  it.each([
    { market_cap: {} },
    { market_cap: null },
    { circulating_supply: 0 },
    { circulating_supply: null },
    { total_supply: "001" },
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

describe("asset profile details", () => {
  it("preserves optional features and amenities returned by the API", () => {
    const parsed = AssetSchema.shape.profile.parse({
      description: "Tokenized asset",
      asset_type: "real_estate",
      status: "active",
      lifecycle: "secondary_market",
      gallery: [],
      features: [{ id: "renewable-energy", name: "Renewable Energy" }],
      amenities: [{ id: "backup-power", name: "Backup Power" }],
    });

    expect(parsed.features?.[0]?.name).toBe("Renewable Energy");
    expect(parsed.amenities?.[0]?.name).toBe("Backup Power");
  });
});

describe("asset profile content", () => {
  const profile = {
    description: "About text",
    asset_type: "commodity",
    status: "active",
    lifecycle: "secondary_market",
    gallery: [],
  };

  it("omits absent optional content", () => {
    const parsed = AssetSchema.shape.profile.parse(profile);

    expect(parsed.tagline).toBeUndefined();
    expect(parsed.why_invest).toBeUndefined();
    expect(parsed.location).toBeUndefined();
  });

  it("keeps investment reasons in order and skips malformed ones", () => {
    const parsed = AssetSchema.shape.profile.parse({
      ...profile,
      why_invest: [
        { title: "First", description: "One" },
        { title: " ", description: "Blank title" },
        { title: "Blank description", description: "" },
        "malformed",
        { title: "Second", description: "Two" },
      ],
    });

    expect(parsed.why_invest).toEqual([
      { title: "First", description: "One" },
      { title: "Second", description: "Two" },
    ]);
  });

  it("drops malformed tagline and location fields without rejecting the profile", () => {
    const parsed = AssetSchema.shape.profile.parse({
      ...profile,
      tagline: 42,
      features: [{ id: "a", name: "Feature" }],
      location: {
        description: { text: "bad" },
        name: "Emirates Gold, DMCC",
        city: "Dubai",
        country: "AE",
        coordinates: { lat: "25" },
      },
    });

    expect(parsed.tagline).toBeUndefined();
    expect(parsed.features).toEqual([{ id: "a", name: "Feature" }]);
    expect(parsed.location).toEqual({
      name: "Emirates Gold, DMCC",
      city: "Dubai",
      country: "AE",
    });
  });
});
