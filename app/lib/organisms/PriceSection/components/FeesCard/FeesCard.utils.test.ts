import { BigNumber } from "bignumber.js";
import { describe, expect, it } from "vitest";

import { calculateOrderSummaryValues } from "./FeesCard.utils";

describe("calculateOrderSummaryValues", () => {
  it("adds the estimated gas fee and orderbook fee exactly once", () => {
    const result = calculateOrderSummaryValues({
      gasFee: "0.000444",
      orderbookFee: 200,
      feeUsdRate: "0.5",
      orderValue: "100",
    });
    expect(result.gasFeeUsd.toFixed(6)).toBe("0.000222");
    expect(result.platformFeeUsd.toFixed(6)).toBe("0.000322");
    expect(result.totalValue.toFixed(6)).toBe("100.000322");
  });

  it.each([200, 100])(
    "converts a %s atom orderbook fee to MVRK, then USD, and adds it once",
    (orderbookFee) => {
      const result = calculateOrderSummaryValues({
        gasFee: "0.01",
        orderbookFee,
        feeUsdRate: "0.5",
        orderValue: "2500",
      });

      const expectedOrderbookFee = new BigNumber(orderbookFee)
        .dividedBy(1_000_000)
        .times("0.5");
      expect(result.orderbookFeeUsd.eq(expectedOrderbookFee)).toBe(true);
      expect(
        result.platformFeeUsd.eq(result.orderbookFeeUsd.plus(result.gasFeeUsd))
      ).toBe(true);
      expect(result.totalValue.eq(result.platformFeeUsd.plus(2500))).toBe(true);
    }
  );

  it("preserves a 200-atom fee at six decimal places with a one-to-one USD rate", () => {
    const result = calculateOrderSummaryValues({
      orderbookFee: 200,
      gasFee: "0.001",
      feeUsdRate: 1,
    });
    expect(result.orderbookFeeUsd.toFixed(6)).toBe("0.000200");
    expect(result.gasFeeUsd.toFixed(6)).toBe("0.001000");
    expect(result.platformFeeUsd.toFixed(6)).toBe("0.001200");
  });

  it("adds the USD gas fee to the order value", () => {
    const result = calculateOrderSummaryValues({
      gasFee: new BigNumber("0.01"),
      feeUsdRate: "0.5",
      orderValue: "2500",
      pricePerShare: "100",
    });

    expect(result.gasFeeUsd.toString()).toBe("0.005");
    expect(result.pricePerShare.toString()).toBe("100");
    expect(result.totalValue.toString()).toBe("2500.005");
  });

  it("falls back to a one-to-one fee rate when no USD rate is available", () => {
    const result = calculateOrderSummaryValues({
      gasFee: "0.01",
      feeUsdRate: "0",
      orderValue: "2500",
    });

    expect(result.gasFeeUsd.toString()).toBe("0.01");
    expect(result.totalValue.toString()).toBe("2500.01");
  });

  it("normalizes invalid values to zero", () => {
    const result = calculateOrderSummaryValues({
      gasFee: "-1",
      feeUsdRate: "not-a-number",
      orderValue: "not-a-number",
      pricePerShare: "-100",
    });

    expect(result.gasFeeUsd.toString()).toBe("0");
    expect(result.pricePerShare.toString()).toBe("0");
    expect(result.totalValue.toString()).toBe("0");
  });
});
