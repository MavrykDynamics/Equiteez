import { describe, expect, it } from "vitest";

import { AssetPriceChangeSchema } from "./prices.schema";

const emptyPriceChange = {
  as_of: null,
  native_quote: "usdt",
  now: null,
  periods: {
    "24h": {
      from_ts: null,
      from: null,
      delta_abs: null,
      change_pct: null,
    },
  },
  symbol: "ustb-usdt",
};

describe("asset price changes", () => {
  it("preserves the USTB response without price history as missing data", () => {
    expect(AssetPriceChangeSchema.parse(emptyPriceChange)).toEqual(
      emptyPriceChange
    );
  });

  it.each([0, 1.25])("preserves an existing price of %s", (now) => {
    const response = {
      ...emptyPriceChange,
      as_of: "2026-10-02T09:26:57Z",
      now,
      periods: {
        "24h": {
          from_ts: "2026-10-01T09:26:57Z",
          from: 1,
          delta_abs: now - 1,
          change_pct: (now - 1) * 100,
        },
      },
    };
    expect(AssetPriceChangeSchema.parse(response)).toEqual(response);
  });

  it.each([
    { as_of: undefined },
    { now: undefined },
    { as_of: 123 },
    { now: "1.25" },
  ])("still rejects missing or malformed fields: %j", (fields) => {
    expect(
      AssetPriceChangeSchema.safeParse({ ...emptyPriceChange, ...fields })
        .success
    ).toBe(false);
  });
});
