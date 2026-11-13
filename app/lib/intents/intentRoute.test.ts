import { BigNumber } from "bignumber.js";
import { describe, expect, it } from "vitest";

import { mockIntentRoutes } from "~/lib/apis/intents/intents.mock";
import {
  getIntentAmountError,
  getIntentRouteAvailability,
  toRawAmount,
} from "./intentRoute";

const [usdt, eth, usdc] = mockIntentRoutes;

describe("route availability", () => {
  it.each([
    [usdt, "available"],
    [eth, "available"],
    [usdc, "unsupported_chain"],
    [{ ...usdt, enabled: false }, "disabled"],
    [
      { ...usdt, destination: { ...usdt.destination, network: "mainnet" } },
      "unsupported_destination",
    ],
  ] as const)("%#: %s", (route, expected) => {
    expect(
      getIntentRouteAvailability(route, [421614, 11155111], "basenet")
    ).toBe(expected);
  });
});

it("disables a route whose destination decimals differ from Equiteez metadata", () => {
  const supported = [421614, 11155111];
  expect(
    getIntentRouteAvailability(usdt, supported, "basenet", { decimals: 6 })
  ).toBe("available");
  expect(
    getIntentRouteAvailability(usdt, supported, "basenet", { decimals: 18 })
  ).toBe("token_mismatch");
});

describe("amount validation", () => {
  it.each([
    [undefined, undefined, "Enter an amount."],
    ["0", undefined, "Enter an amount."],
    ["0.5", undefined, "Minimum deposit is 1 USDT."],
    ["10001", undefined, "Maximum deposit is 10,000 USDT."],
    ["5", "4", "Insufficient USDT balance."],
    ["5", "5", null],
    ["1", undefined, null],
  ])("%s with balance %s", (amount, balance, error) => {
    expect(
      getIntentAmountError(
        usdt,
        amount === undefined ? undefined : new BigNumber(amount),
        balance === undefined ? undefined : new BigNumber(balance)
      )
    ).toBe(error);
  });

  it("rejects more decimals than the source token supports", () => {
    expect(getIntentAmountError(usdc, new BigNumber("1.0000001"))).toBe(
      "USDC supports up to 6 decimal places."
    );
    expect(toRawAmount(new BigNumber("1.0000001"), 6)).toBeNull();
  });

  it("compares limits in raw units without float rounding", () => {
    expect(toRawAmount(new BigNumber("0.1"), 18)).toBe("100000000000000000");
    expect(getIntentAmountError(eth, new BigNumber("0.001"))).toBeNull();
    expect(
      getIntentAmountError(eth, new BigNumber("0.000999999999999999"))
    ).toBe("Minimum deposit is 0.001 ETH.");
  });
});
