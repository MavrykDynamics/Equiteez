import { describe, expect, it } from "vitest";
import {
  normalizeRefundableOrdersList,
  RefundableOrdersListSchema,
} from "./orders.schema";

describe("RefundableOrdersListSchema", () => {
  it("normalizes a missing orders array to an empty list", () => {
    const response = RefundableOrdersListSchema.parse({ total_count: 0 });

    expect(normalizeRefundableOrdersList(response)).toEqual({
      orders: [],
      total_count: 0,
    });
  });

  it("normalizes a missing total count to the returned orders count", () => {
    const response = RefundableOrdersListSchema.parse({ orders: [] });

    expect(normalizeRefundableOrdersList(response)).toEqual({
      orders: [],
      total_count: 0,
    });
  });

  it("normalizes an empty response to an empty orders list", () => {
    const response = RefundableOrdersListSchema.parse({});

    expect(normalizeRefundableOrdersList(response)).toEqual({
      orders: [],
      total_count: 0,
    });
  });

  it("rejects a non-array orders field", () => {
    expect(() =>
      RefundableOrdersListSchema.parse({ orders: {}, total_count: 0 })
    ).toThrow();
  });

  it("rejects a non-number total count field", () => {
    expect(() =>
      RefundableOrdersListSchema.parse({ orders: [], total_count: "0" })
    ).toThrow();
  });
});
