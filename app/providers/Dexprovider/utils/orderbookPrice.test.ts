import { describe, expect, it } from "vitest";

import {
  getBestBuyPrice,
  getBestSellPrice,
  getMarketBuyPrice,
  getMarketSellPrice,
  getOrderBookPricesPerToken,
  resolveMarketPrice,
} from "./orderbookPrice";

// Raw orderbook prices are stored in atoms; with 6 decimals a raw value of
// 5_000_000 represents a real price of $5.00.
const DECIMALS = 6;
const ATOM = 1_000_000;

describe("getBestBuyPrice (best ask = cheapest sell)", () => {
  it("returns 0 when there are no sell orders", () => {
    expect(getBestBuyPrice([]).toNumber()).toBe(0);
  });

  it("returns the lowest sell price", () => {
    expect(getBestBuyPrice([7, 5, 6]).toNumber()).toBe(5);
  });

  it("handles a single order", () => {
    expect(getBestBuyPrice([42]).toNumber()).toBe(42);
  });
});

describe("getBestSellPrice (best bid = highest buy)", () => {
  it("returns 0 when there are no buy orders", () => {
    expect(getBestSellPrice([]).toNumber()).toBe(0);
  });

  it("returns the highest buy price", () => {
    expect(getBestSellPrice([4, 7, 3]).toNumber()).toBe(7);
  });

  it("handles a single order", () => {
    expect(getBestSellPrice([9]).toNumber()).toBe(9);
  });
});

describe("getMarketBuyPrice / getMarketSellPrice (atom -> token)", () => {
  it("converts the raw ask price using the quote decimals", () => {
    expect(getMarketBuyPrice(5 * ATOM, DECIMALS).toNumber()).toBe(5);
  });

  it("converts the raw bid price using the quote decimals", () => {
    expect(getMarketSellPrice(4 * ATOM, DECIMALS).toNumber()).toBe(4);
  });

  it("respects non-default decimals", () => {
    expect(getMarketBuyPrice(250, 2).toNumber()).toBe(2.5);
  });

  it("returns 0 for an empty side (raw price 0)", () => {
    expect(getMarketBuyPrice(0, DECIMALS).toNumber()).toBe(0);
    expect(getMarketSellPrice(0, DECIMALS).toNumber()).toBe(0);
  });
});

describe("getOrderBookPricesPerToken", () => {
  it("maps the cheapest sell to buy price and highest bid to sell price", () => {
    const result = getOrderBookPricesPerToken(
      "KT1orderbook",
      [4, 7, 3], // raw buy prices
      [7, 5, 6] // raw sell prices
    );

    expect(result.address).toBe("KT1orderbook");
    expect(result.marketBuyPrice.toNumber()).toBe(5); // cheapest sell
    expect(result.marketSellPrice.toNumber()).toBe(7); // highest bid
  });
});

describe("resolveMarketPrice (market order quote)", () => {
  const lowestSellPrice = 5 * ATOM; // best ask -> $5
  const highestBuyPrice = 4 * ATOM; // best bid -> $4

  it("quotes the best ask for a buy when both sides exist", () => {
    expect(
      resolveMarketPrice(
        true,
        lowestSellPrice,
        highestBuyPrice,
        DECIMALS
      ).toNumber()
    ).toBe(5);
  });

  it("quotes the best bid for a sell when both sides exist", () => {
    expect(
      resolveMarketPrice(
        false,
        lowestSellPrice,
        highestBuyPrice,
        DECIMALS
      ).toNumber()
    ).toBe(4);
  });

  // The QA-reported bug: market sell, no bids, asks present -> used to show $1.
  it("falls back to the best ask for a sell when there are no bids", () => {
    expect(
      resolveMarketPrice(false, lowestSellPrice, 0, DECIMALS).toNumber()
    ).toBe(5);
  });

  it("falls back to the best bid for a buy when there are no asks", () => {
    expect(
      resolveMarketPrice(true, 0, highestBuyPrice, DECIMALS).toNumber()
    ).toBe(4);
  });

  it("never returns the legacy $1 placeholder for a one-sided book", () => {
    expect(
      resolveMarketPrice(false, lowestSellPrice, 0, DECIMALS).toNumber()
    ).not.toBe(1);
  });

  it("returns 0 when the book is empty on both sides", () => {
    expect(resolveMarketPrice(true, 0, 0, DECIMALS).toNumber()).toBe(0);
    expect(resolveMarketPrice(false, 0, 0, DECIMALS).toNumber()).toBe(0);
  });

  it("applies quote decimals to the resolved price", () => {
    // raw ask 250 with 2 decimals -> $2.50
    expect(resolveMarketPrice(true, 250, 0, 2).toNumber()).toBe(2.5);
  });
});
