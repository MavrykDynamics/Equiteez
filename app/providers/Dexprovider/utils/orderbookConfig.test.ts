import { describe, expect, it } from "vitest";
// eslint-disable-next-line import/no-named-as-default
import BigNumber from "bignumber.js";

import {
  getDisplayTickSize,
  isPriceAtomsAlignedToTickSize,
  isPriceAlignedToTickSize,
} from "./orderbookConfig";

describe("getDisplayTickSize", () => {
  it("converts a raw tick size using quote token decimals", () => {
    expect(getDisplayTickSize(10_000, 6).toNumber()).toBe(0.01);
  });

  it("returns 0 for missing or invalid tick sizes", () => {
    expect(getDisplayTickSize(0, 6).toNumber()).toBe(0);
    expect(getDisplayTickSize(-1, 6).toNumber()).toBe(0);
  });
});

describe("isPriceAlignedToTickSize", () => {
  it("accepts a limit price that is an exact multiple of the tick size", () => {
    expect(
      isPriceAlignedToTickSize({
        price: new BigNumber("5.12"),
        rawTickSize: 10_000,
        quoteTokenDecimals: 6,
      })
    ).toBe(true);
  });

  it("rejects a limit price that is not an exact multiple of the tick size", () => {
    expect(
      isPriceAlignedToTickSize({
        price: new BigNumber("5.125"),
        rawTickSize: 10_000,
        quoteTokenDecimals: 6,
      })
    ).toBe(false);
  });

  it("handles non-default quote decimals", () => {
    expect(
      isPriceAlignedToTickSize({
        price: "1.10",
        rawTickSize: 5,
        quoteTokenDecimals: 2,
      })
    ).toBe(true);
    expect(
      isPriceAlignedToTickSize({
        price: "1.12",
        rawTickSize: 5,
        quoteTokenDecimals: 2,
      })
    ).toBe(false);
  });

  it("does not block validation when price or tick size is unavailable", () => {
    expect(
      isPriceAlignedToTickSize({
        price: undefined,
        rawTickSize: 10_000,
        quoteTokenDecimals: 6,
      })
    ).toBe(true);
    expect(
      isPriceAlignedToTickSize({
        price: "5.125",
        rawTickSize: 0,
        quoteTokenDecimals: 6,
      })
    ).toBe(true);
  });

  it("rejects a price with more precision than quote-token atoms", () => {
    expect(
      isPriceAlignedToTickSize({
        price: "1.0000001",
        rawTickSize: 1,
        quoteTokenDecimals: 6,
      })
    ).toBe(false);
  });
});

describe("isPriceAtomsAlignedToTickSize", () => {
  it("accepts an exactly aligned atom price", () => {
    expect(
      isPriceAtomsAlignedToTickSize({
        priceAtoms: "10000000",
        tickSizeAtoms: "10000",
      })
    ).toBe(true);
  });

  it("rejects a price one atom below a tick", () => {
    expect(
      isPriceAtomsAlignedToTickSize({
        priceAtoms: "9999999",
        tickSizeAtoms: "10000",
      })
    ).toBe(false);
  });

  it("rejects a price one atom above a tick", () => {
    expect(
      isPriceAtomsAlignedToTickSize({
        priceAtoms: "10000001",
        tickSizeAtoms: "10000",
      })
    ).toBe(false);
  });

  it("handles decimal quote-token atom values", () => {
    expect(
      isPriceAlignedToTickSize({
        price: "1.25",
        rawTickSize: 25,
        quoteTokenDecimals: 2,
      })
    ).toBe(true);
  });

  it("handles large atom values", () => {
    expect(
      isPriceAtomsAlignedToTickSize({
        priceAtoms: "90071992547409930000",
        tickSizeAtoms: "10000",
      })
    ).toBe(true);
  });
});
