import { describe, expect, it } from "vitest";

import { IntentsApiError } from "~/lib/apis/intents";
import {
  isIdempotencyKey,
  isOperationCapability,
  newIdempotencyKey,
  newOperationCapability,
} from "./intentCapability";
import {
  estimateAcceptedMinAmountOut,
  getIntentErrorCopy,
  getIntentRequestKey,
  isIntentInstructionsExpired,
  isRetryableIntentError,
} from "./intentQuote";

describe("estimateAcceptedMinAmountOut", () => {
  const base = {
    amountIn: "2000000000000000000",
    sourceDecimals: 18,
    settlementDecimals: 18,
    destinationDecimals: 6,
    pricing: { kind: "parity" } as const,
    feeAllowanceBps: 50,
    slippageBps: 50,
  };

  it("applies fee headroom and slippage, rounded down to FA2 precision", () => {
    expect(estimateAcceptedMinAmountOut(base)).toEqual({
      expected: "2000000000000000000",
      // 2 × 0.995 × 0.995 = 1.98005
      minimum: "1980050000000000000",
    });
  });

  it("rounds sub-FA2 units down so the minimum is representable", () => {
    const result = estimateAcceptedMinAmountOut({
      ...base,
      amountIn: "1000000000000000001",
      feeAllowanceBps: 0,
      slippageBps: 0,
    });
    expect(result?.expected).toBe("1000000000000000001");
    expect(result?.minimum).toBe("1000000000000000000");
  });

  it("converts decimals and applies a reference rate", () => {
    expect(
      estimateAcceptedMinAmountOut({
        ...base,
        amountIn: "1000000", // 1 token with 6 decimals
        sourceDecimals: 6,
        pricing: { kind: "reference", rate: "3000" },
        feeAllowanceBps: 0,
        slippageBps: 100,
      })
    ).toEqual({
      expected: "3000000000000000000000",
      minimum: "2970000000000000000000",
    });
  });

  it("returns null when nothing representable remains", () => {
    expect(estimateAcceptedMinAmountOut({ ...base, amountIn: "1" })).toBeNull();
  });
});

describe("request helpers", () => {
  it("changes the request key with any material input", () => {
    const inputs = {
      account: "mv1a",
      sourceAddress: "0xAbC",
      routeId: "r",
      routeVersion: 1,
      amountIn: "1",
      slippageBps: 50,
    };
    const key = getIntentRequestKey(inputs);
    expect(getIntentRequestKey({ ...inputs, sourceAddress: "0xabc" })).toBe(
      key
    );
    for (const patch of [
      { account: "mv1b" },
      { routeVersion: 2 },
      { amountIn: "2" },
      { slippageBps: 100 },
    ])
      expect(getIntentRequestKey({ ...inputs, ...patch })).not.toBe(key);
  });

  it("checks expiry with a safety margin", () => {
    const at = Date.parse("2026-11-13T10:10:00Z");
    expect(isIntentInstructionsExpired("2026-11-13T10:10:00Z", at - 1)).toBe(
      false
    );
    expect(
      isIntentInstructionsExpired("2026-11-13T10:10:00Z", at - 1, 15_000)
    ).toBe(true);
  });

  it("keeps the idempotency scope only for possibly-committed failures", () => {
    const error = (code: IntentsApiError["code"]) =>
      new IntentsApiError(code, "");
    for (const code of [
      "NETWORK",
      "INTERNAL_ERROR",
      "DEPENDENCY_UNAVAILABLE",
      "RATE_LIMITED",
    ] as const)
      expect(isRetryableIntentError(error(code))).toBe(true);
    for (const code of [
      "VALIDATION_ERROR",
      "AMOUNT_OUT_OF_RANGE",
      "ROUTE_UNAVAILABLE",
      "IDEMPOTENCY_CONFLICT",
      "REHEARSAL_SCOPE_MISMATCH",
    ] as const)
      expect(isRetryableIntentError(error(code))).toBe(false);
  });

  it("shows the server request ID for support", () => {
    expect(
      getIntentErrorCopy(
        new IntentsApiError("ROUTE_UNAVAILABLE", "x", 409, "req-42")
      )
    ).toMatch(/Request ID: req-42/);
  });
});

describe("operation capability", () => {
  it("is 32 random bytes as canonical unpadded base64url", () => {
    const capability = newOperationCapability();
    expect(capability).toHaveLength(43);
    expect(isOperationCapability(capability)).toBe(true);
    expect(capability).not.toMatch(/[+/=]/);
    expect(newOperationCapability()).not.toBe(capability);
    const decoded = atob(
      capability.replaceAll("-", "+").replaceAll("_", "/") + "="
    );
    expect(decoded).toHaveLength(32);
  });

  it("rejects non-canonical capabilities", () => {
    expect(isOperationCapability("A".repeat(42) + "B")).toBe(false);
    expect(isOperationCapability("A".repeat(44))).toBe(false);
  });

  it("generates valid idempotency keys", () => {
    expect(isIdempotencyKey(newIdempotencyKey())).toBe(true);
    expect(isIdempotencyKey("short")).toBe(false);
    expect(isIdempotencyKey("has space key")).toBe(false);
  });
});
