import { describe, expect, it } from "vitest";

import { IntentsApiError } from "~/lib/apis/intents";
import {
  isIdempotencyKey,
  isOperationCapability,
  newIdempotencyKey,
  newOperationCapability,
} from "./intentCapability";
import {
  formatCountdown,
  formatTimeEstimate,
  getAcceptedMinAmountOut,
  getIntentErrorCopy,
  getIntentRequestKey,
  isIntentCatalogChangedError,
  isIntentInstructionsExpired,
  isIntentPreviewExpired,
  isRetryableIntentError,
} from "./intentQuote";
import { preview } from "./intents.fixtures";

describe("preview helpers", () => {
  it("accepts the displayed bridgeable minimum", () => {
    expect(
      getAcceptedMinAmountOut(
        preview({ bridgeableMinAmountOut: "123", destinationMinAmountOut: "9" })
      )
    ).toBe("123");
  });

  it("treats a preview as expired at its expiresAt", () => {
    const quote = preview({ expiresAt: "2026-11-13T10:00:30.000Z" });
    const at = Date.parse(quote.expiresAt);
    expect(isIntentPreviewExpired(quote, at - 1)).toBe(false);
    expect(isIntentPreviewExpired(quote, at)).toBe(true);
  });

  it("formats countdowns and time estimates", () => {
    expect(formatCountdown(65)).toBe("1:05");
    expect(formatCountdown(2 * 3600 + 5)).toBe("2:00:05");
    expect(formatTimeEstimate(35)).toBe("~35 s");
    expect(formatTimeEstimate(600)).toBe("~10 min");
    expect(formatTimeEstimate(null)).toBeNull();
  });
});

describe("request helpers", () => {
  it("changes the request key with any material input", () => {
    const inputs = {
      account: "mv1a",
      sourceAssetId: "nep141:sol.omft.near",
      settlementTokenId: "usdt0-arbitrum",
      settlementTokenVersion: 1,
      recipient: "mv1a",
      refundAddress: "EKpQ",
      amountIn: "1",
      slippageBps: 50,
    };
    const key = getIntentRequestKey(inputs);
    expect(getIntentRequestKey({ ...inputs })).toBe(key);
    for (const patch of [
      { account: "mv1b" },
      { sourceAssetId: "nep141:btc.omft.near" },
      { settlementTokenVersion: 2 },
      { refundAddress: "EKpR" },
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
    // Any 5xx may have committed the operation (backend.md §5).
    expect(
      isRetryableIntentError(new IntentsApiError("CATALOG_STALE", "", 503))
    ).toBe(true);
    for (const code of [
      "VALIDATION_ERROR",
      "AMOUNT_TOO_LOW",
      "SOURCE_ASSET_UNAVAILABLE",
      "IDEMPOTENCY_CONFLICT",
      "ADMISSION_CAPACITY_EXCEEDED",
    ] as const)
      expect(isRetryableIntentError(error(code))).toBe(false);
  });

  it("refreshes metadata after availability errors", () => {
    expect(
      isIntentCatalogChangedError(
        new IntentsApiError("SETTLEMENT_TOKEN_UNAVAILABLE", "")
      )
    ).toBe(true);
    expect(
      isIntentCatalogChangedError(new IntentsApiError("AMOUNT_TOO_LOW", ""))
    ).toBe(false);
  });

  it("shows the server request ID for support", () => {
    expect(
      getIntentErrorCopy(
        new IntentsApiError("PROVIDER_REJECTED", "x", 409, "req-42")
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
