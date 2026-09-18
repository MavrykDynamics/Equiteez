import { BigNumber } from "bignumber.js";
import { describe, expect, it } from "vitest";

import { calculateOrderSummaryValues } from "./FeesCard.utils";

describe("calculateOrderSummaryValues", () => {
  it.each([200, 100])(
    "converts a %s MVRK orderbook fee and adds it once to the summary",
    (orderbookFee) => {
      const result = calculateOrderSummaryValues({
        networkFee: "0.01",
        orderbookFee,
        networkFeeUsdRate: "0.5",
        orderValue: "2500",
      });

      expect(result.orderbookFeeUsd.toNumber()).toBe(orderbookFee * 0.5);
      expect(result.platformFeeUsd.toNumber()).toBe(orderbookFee * 0.5 + 0.005);
      expect(result.totalValue.toNumber()).toBe(
        2500 + orderbookFee * 0.5 + 0.005
      );
    }
  );

  it("adds the USD network fee to the order value", () => {
    const result = calculateOrderSummaryValues({
      networkFee: new BigNumber("0.01"),
      networkFeeUsdRate: "0.5",
      orderValue: "2500",
      pricePerShare: "100",
    });

    expect(result.networkFeeUsd.toString()).toBe("0.005");
    expect(result.pricePerShare.toString()).toBe("100");
    expect(result.totalValue.toString()).toBe("2500.005");
  });

  it("falls back to a one-to-one fee rate when no USD rate is available", () => {
    const result = calculateOrderSummaryValues({
      networkFee: "0.01",
      networkFeeUsdRate: "0",
      orderValue: "2500",
    });

    expect(result.networkFeeUsd.toString()).toBe("0.01");
    expect(result.totalValue.toString()).toBe("2500.01");
  });

  it("normalizes invalid values to zero", () => {
    const result = calculateOrderSummaryValues({
      networkFee: "-1",
      networkFeeUsdRate: "not-a-number",
      orderValue: "not-a-number",
      pricePerShare: "-100",
    });

    expect(result.networkFeeUsd.toString()).toBe("0");
    expect(result.pricePerShare.toString()).toBe("0");
    expect(result.totalValue.toString()).toBe("0");
  });
});
