import { BigNumber } from "bignumber.js";
import { describe, expect, it } from "vitest";

import { calculateOrderSummaryValues } from "./FeesCard.utils";

describe("calculateOrderSummaryValues", () => {
  it("keeps the platform total unchanged when gas is split from network cost", () => {
    const combined = calculateOrderSummaryValues({
      networkFee: "0.001154",
      orderbookFee: 200,
      networkFeeUsdRate: "0.5",
    });
    const split = calculateOrderSummaryValues({
      networkFee: "0.001150",
      gasFee: "0.000004",
      orderbookFee: 200,
      networkFeeUsdRate: "0.5",
    });
    expect(split.gasFeeUsd.toFixed(6)).toBe("0.000002");
    expect(split.platformFeeUsd.eq(combined.platformFeeUsd)).toBe(true);
    expect(
      split.platformFeeUsd.eq(
        split.orderbookFeeUsd.plus(split.networkFeeUsd).plus(split.gasFeeUsd)
      )
    ).toBe(true);
    expect(split.totalValue.eq(combined.totalValue)).toBe(true);
  });

  it.each([200, 100])(
    "converts a %s atom orderbook fee to MVRK, then USD, and adds it once",
    (orderbookFee) => {
      const result = calculateOrderSummaryValues({
        networkFee: "0.01",
        orderbookFee,
        networkFeeUsdRate: "0.5",
        orderValue: "2500",
      });

      const expectedOrderbookFee = new BigNumber(orderbookFee)
        .dividedBy(1_000_000)
        .times("0.5");
      expect(result.orderbookFeeUsd.eq(expectedOrderbookFee)).toBe(true);
      expect(
        result.platformFeeUsd.eq(
          result.orderbookFeeUsd.plus(result.networkFeeUsd)
        )
      ).toBe(true);
      expect(result.totalValue.eq(result.platformFeeUsd.plus(2500))).toBe(true);
    }
  );

  it("preserves a 200-atom fee at six decimal places with a one-to-one USD rate", () => {
    const result = calculateOrderSummaryValues({
      orderbookFee: 200,
      networkFee: "0.001",
      networkFeeUsdRate: 1,
    });
    expect(result.orderbookFeeUsd.toFixed(6)).toBe("0.000200");
    expect(result.networkFeeUsd.toFixed(6)).toBe("0.001000");
    expect(result.platformFeeUsd.toFixed(6)).toBe("0.001200");
  });

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
