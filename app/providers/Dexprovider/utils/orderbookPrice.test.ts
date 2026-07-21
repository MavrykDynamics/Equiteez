import { describe, expect, it } from "vitest";
// eslint-disable-next-line import/no-named-as-default
import BigNumber from "bignumber.js";

import {
  deriveQuantityFromPercent,
  exceedsAvailableBalance,
  getBestLimitAsk,
  getBestLimitBid,
  getBestPricesFromOpenOrders,
  getBestBuyPrice,
  getBestSellPrice,
  getCurrentPriceFromOpenOrders,
  getMarketBuyReferencePrice,
  getMarketBuyTokenAmountAtoms,
  getMarketBuyPrice,
  getMarketSellReferencePrice,
  getMarketSellPrice,
  getOrderBookPricesPerToken,
  getQuoteValueAtomsForOrder,
  resolveMarketPrice,
  safeDivByPrice,
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

describe("safeDivByPrice (empty-book division guard)", () => {
  it("divides a quote amount by the price to get a token quantity", () => {
    expect(
      safeDivByPrice(new BigNumber(100), new BigNumber(5))?.toNumber()
    ).toBe(20);
  });

  // The regression guard: resolveMarketPrice returns 0 for an empty book, and a
  // raw div(0) would yield Infinity (which is truthy and slips past || / ??).
  it("returns undefined when the price is 0 (never Infinity)", () => {
    const result = safeDivByPrice(new BigNumber(100), new BigNumber(0));
    expect(result).toBeUndefined();
  });

  it("returns undefined when the amount is missing", () => {
    expect(safeDivByPrice(undefined, new BigNumber(5))).toBeUndefined();
  });

  it("returns 0 tokens for a 0 spend at a valid price", () => {
    expect(safeDivByPrice(new BigNumber(0), new BigNumber(5))?.toNumber()).toBe(
      0
    );
  });

  it("never produces a non-finite result for a 0 price", () => {
    const result = safeDivByPrice(new BigNumber(999), new BigNumber(0));
    expect(result === undefined || result.isFinite()).toBe(true);
  });
});

describe("deriveQuantityFromPercent (limit-buy % selector)", () => {
  it("sizes token quantity from a % of the balance at the limit price", () => {
    // 50% of $1000 = $500 spend, at $5/token -> 100 tokens
    expect(
      deriveQuantityFromPercent(1000, 50, new BigNumber(5))?.toNumber()
    ).toBe(100);
  });

  it("returns undefined when the limit price is 0 (can't size, never Infinity)", () => {
    expect(
      deriveQuantityFromPercent(1000, 50, new BigNumber(0))
    ).toBeUndefined();
  });

  it("returns 0 tokens for a 0% selection at a valid price", () => {
    expect(
      deriveQuantityFromPercent(1000, 0, new BigNumber(5))?.toNumber()
    ).toBe(0);
  });

  it("scales linearly with the percentage", () => {
    expect(
      deriveQuantityFromPercent(1000, 100, new BigNumber(4))?.toNumber()
    ).toBe(250);
  });
});

describe("getBestPricesFromOpenOrders (live best ask/bid)", () => {
  it("takes the lowest sell as best ask and highest buy as best bid", () => {
    expect(
      getBestPricesFromOpenOrders(
        [{ price_per_rwa_token: 10 }, { price_per_rwa_token: 8 }],
        [{ price_per_rwa_token: 35 }, { price_per_rwa_token: 30 }]
      )
    ).toEqual({ lowestSellPrice: 30, highestBuyPrice: 10 });
  });

  it("excludes sentinel-priced market orders (sell 0, buy 999_999_999_999)", () => {
    expect(
      getBestPricesFromOpenOrders(
        [{ price_per_rwa_token: 999_999_999_999 }, { price_per_rwa_token: 10 }],
        [{ price_per_rwa_token: 0 }, { price_per_rwa_token: 30 }]
      )
    ).toEqual({ lowestSellPrice: 30, highestBuyPrice: 10 });
  });

  it("excludes rows explicitly marked as market orders", () => {
    expect(
      getBestPricesFromOpenOrders(
        [
          { price_per_rwa_token: 12, isMarketOrder: true },
          { price_per_rwa_token: 10 },
        ],
        [
          { price_per_rwa_token: 8, isMarketOrder: true },
          { price_per_rwa_token: 30 },
        ]
      )
    ).toEqual({ lowestSellPrice: 30, highestBuyPrice: 10 });
  });

  it("returns 0 for an empty side (so no orders -> 0, handled by fallback)", () => {
    expect(getBestPricesFromOpenOrders([], [])).toEqual({
      lowestSellPrice: 0,
      highestBuyPrice: 0,
    });
  });
});

describe("strict market placement reference prices", () => {
  it("market buy uses only the best real limit ask", () => {
    const ask = getBestLimitAsk([
      { price_per_rwa_token: 12 * ATOM },
      { price_per_rwa_token: 10 * ATOM },
      { price_per_rwa_token: 0 },
    ]);

    expect(ask?.toFixed()).toBe(String(10 * ATOM));
    expect(
      getMarketBuyReferencePrice(
        [
          { price_per_rwa_token: 12 * ATOM },
          { price_per_rwa_token: 10 * ATOM },
        ],
        DECIMALS
      )?.toNumber()
    ).toBe(10);
  });

  it("market buy returns null when no real asks exist", () => {
    expect(getBestLimitAsk([{ price_per_rwa_token: 0 }])).toBeNull();
    expect(getMarketBuyReferencePrice([], DECIMALS)).toBeNull();
  });

  it("market sell uses only the best real limit bid", () => {
    const bid = getBestLimitBid([
      { price_per_rwa_token: 8 * ATOM },
      { price_per_rwa_token: 9 * ATOM },
      { price_per_rwa_token: 999_999_999_999 },
    ]);

    expect(bid?.toFixed()).toBe(String(9 * ATOM));
    expect(
      getMarketSellReferencePrice(
        [
          { price_per_rwa_token: 8 * ATOM },
          { price_per_rwa_token: 9 * ATOM },
        ],
        DECIMALS
      )?.toNumber()
    ).toBe(9);
  });

  it("market sell returns null when no real bids exist", () => {
    expect(
      getBestLimitBid([{ price_per_rwa_token: 999_999_999_999 }])
    ).toBeNull();
    expect(getMarketSellReferencePrice([], DECIMALS)).toBeNull();
  });
});

describe("getMarketBuyTokenAmountAtoms", () => {
  it("floors 40 / 6 so the implied quote cost stays within budget", () => {
    const tokenAtoms = getMarketBuyTokenAmountAtoms({
      quoteBudget: "40",
      quoteTokenDecimals: 6,
      baseTokenDecimals: 6,
      pricePerTokenAtoms: "6000000",
    });

    expect(tokenAtoms.toFixed()).toBe("6666666");
    expect(
      getQuoteValueAtomsForOrder({
        tokenAmountAtoms: tokenAtoms,
        pricePerTokenAtoms: "6000000",
        baseTokenDecimals: 6,
      }).lte("40000000")
    ).toBe(true);
  });

  it("floors 1 / 3 instead of rounding up", () => {
    expect(
      getMarketBuyTokenAmountAtoms({
        quoteBudget: "1",
        quoteTokenDecimals: 6,
        baseTokenDecimals: 6,
        pricePerTokenAtoms: "3000000",
      }).toFixed()
    ).toBe("333333");
  });

  it("handles a value near a token-atom boundary", () => {
    expect(
      getMarketBuyTokenAmountAtoms({
        quoteBudget: "0.000001",
        quoteTokenDecimals: 6,
        baseTokenDecimals: 6,
        pricePerTokenAtoms: "3",
      }).toFixed()
    ).toBe("333333");
  });

  it("handles large amounts above Number.MAX_SAFE_INTEGER without precision loss", () => {
    const tokenAtoms = getMarketBuyTokenAmountAtoms({
      quoteBudget: "9007199254740993",
      quoteTokenDecimals: 6,
      baseTokenDecimals: 6,
      pricePerTokenAtoms: "3000000",
    });

    expect(tokenAtoms.toFixed()).toBe("3002399751580331000000");
  });
});

describe("getCurrentPriceFromOpenOrders", () => {
  it("uses the same live best ask/bid resolver as the secondary price block", () => {
    const currentPrice = getCurrentPriceFromOpenOrders({
      buyOrders: [{ price_per_rwa_token: 4 * ATOM }],
      sellOrders: [
        { price_per_rwa_token: 7 * ATOM },
        { price_per_rwa_token: 5 * ATOM },
      ],
      quoteTokenDecimals: DECIMALS,
    });

    expect(currentPrice.toNumber()).toBe(5);
  });

  it("falls back to the best bid when there are no sell orders", () => {
    const currentPrice = getCurrentPriceFromOpenOrders({
      buyOrders: [{ price_per_rwa_token: 4 * ATOM }],
      sellOrders: [],
      quoteTokenDecimals: DECIMALS,
    });

    expect(currentPrice.toNumber()).toBe(4);
  });
});

describe("exceedsAvailableBalance (side-aware order guard)", () => {
  it("BUY: false when total is within the quote balance", () => {
    expect(
      exceedsAvailableBalance({
        isBuyAction: true,
        total: new BigNumber(500),
        amount: new BigNumber(10),
        usdBalance: 1000,
        tokenBalance: 0,
      })
    ).toBe(false);
  });

  it("BUY: true when total exceeds the quote balance (overspend)", () => {
    expect(
      exceedsAvailableBalance({
        isBuyAction: true,
        total: new BigNumber(1500),
        amount: new BigNumber(10),
        usdBalance: 1000,
        tokenBalance: 0,
      })
    ).toBe(true);
  });

  it("SELL: true when amount exceeds the token balance (oversell)", () => {
    expect(
      exceedsAvailableBalance({
        isBuyAction: false,
        total: new BigNumber(1000000),
        amount: new BigNumber(200),
        usdBalance: 10000,
        tokenBalance: 100,
      })
    ).toBe(true);
  });

  it("SELL: false when amount is within the token balance", () => {
    expect(
      exceedsAvailableBalance({
        isBuyAction: false,
        total: new BigNumber(250),
        amount: new BigNumber(50),
        usdBalance: 0,
        tokenBalance: 100,
      })
    ).toBe(false);
  });

  it("returns false (not undefined) when the relevant operand is undefined", () => {
    expect(
      exceedsAvailableBalance({
        isBuyAction: true,
        total: undefined,
        amount: undefined,
        usdBalance: 1000,
        tokenBalance: 100,
      })
    ).toBe(false);
  });

  it("returns false for a NaN operand (BigNumber NaN comparisons are false)", () => {
    expect(
      exceedsAvailableBalance({
        isBuyAction: true,
        total: new BigNumber(NaN),
        amount: new BigNumber(NaN),
        usdBalance: 1000,
        tokenBalance: 100,
      })
    ).toBe(false);
  });
});
