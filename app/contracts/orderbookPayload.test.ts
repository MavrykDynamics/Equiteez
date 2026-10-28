import { describe, expect, it } from "vitest";
import { buildOrderPayload, type OrderPayloadParams } from "./orderbookPayload";

const params: OrderPayloadParams = {
  rwaTokenAmount: "1000000",
  pricePerRwaToken: "100000",
  currency: " USDT ",
  orderExpiry: null,
  isMarketOrder: false,
  baseTokenDecimals: 6,
  tickSizeAtoms: "100000",
  quantityTickSizeAtoms: "10000",
  minRwaTokenAmount: "1",
  minQuoteValue: "1",
};

describe("shared order payload validation", () => {
  it("preserves enormous exact quantities and expiry without mutating input", () => {
    const input = Object.freeze({
      ...params,
      rwaTokenAmount: "90071992547409931234567890000",
      orderExpiry: "2030-01-01T00:00:00Z",
    });
    expect(buildOrderPayload(input)).toEqual({
      rwaTokenAmount: input.rwaTokenAmount,
      pricePerRwaToken: "100000",
      currency: "USDT",
      orderExpiry: input.orderExpiry,
      isMarketOrder: false,
    });
    expect(input.currency).toBe(" USDT ");
  });

  it.each([true, false])(
    "rejects off-tick quantity without rounding (market=%s)",
    (isMarketOrder) => {
      expect(() =>
        buildOrderPayload({
          ...params,
          isMarketOrder,
          rwaTokenAmount: "999999",
        })
      ).toThrow("Quantity is not aligned");
    }
  );

  it("applies price ticks only to limit orders", () => {
    const input = { ...params, pricePerRwaToken: "100001" };
    expect(() => buildOrderPayload(input)).toThrow("Price is not aligned");
    expect(
      buildOrderPayload({ ...input, isMarketOrder: true }).pricePerRwaToken
    ).toBe("100001");
  });

  it("floors quote value before checking the minimum", () => {
    const input = {
      ...params,
      rwaTokenAmount: "3",
      pricePerRwaToken: "5",
      baseTokenDecimals: 1,
      quantityTickSizeAtoms: "1",
      tickSizeAtoms: "1",
    };
    expect(() => buildOrderPayload({ ...input, minQuoteValue: "2" })).toThrow(
      "quote value is below"
    );
    expect(
      buildOrderPayload({ ...input, minQuoteValue: "1" }).rwaTokenAmount
    ).toBe("3");
  });

  it.each([
    [{ currency: " " }, "currency key"],
    [{ orderExpiry: "invalid" }, "valid timestamp"],
    [{ rwaTokenAmount: "0" }, "greater than zero"],
    [{ pricePerRwaToken: "1.5" }, "integer"],
    [{ quantityTickSizeAtoms: undefined }, "tick size is required"],
    [{ minRwaTokenAmount: "1000001" }, "amount is below"],
  ] as const)("rejects invalid payload %j", (invalid, message) => {
    expect(() => buildOrderPayload({ ...params, ...invalid })).toThrow(message);
  });
});
