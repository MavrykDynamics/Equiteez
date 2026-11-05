import { describe, expect, it } from "vitest";
import { RelayApiError } from "./relay.errors";
import { getRelayFailureNotice } from "./relayFailure";

const error = (code: string, retryAfterMs = 0) =>
  new RelayApiError(402, code, "give-up", undefined, retryAfterMs);

describe("relay failure notice", () => {
  it("offers Top Up only for the user's credit shortage", () => {
    expect(getRelayFailureNotice(error("FEE_CREDIT_REQUIRED"))?.kind).toBe(
      "credit-shortage"
    );
    // A generic 402 is not a credit shortage.
    expect(getRelayFailureNotice(error("HTTP_ERROR"))).toBeNull();
  });
  it.each(["RELAY_UNAVAILABLE", "CONTRACT_NOT_RELAYABLE", "QUOTA_EXCEEDED"])(
    "%s offers MVRK, not Top Up",
    (code) => {
      const notice = getRelayFailureNotice(error(code));
      expect(notice?.kind).toBe("unavailable");
      expect(notice?.message).toContain("switch to MVRK");
    }
  );
  it("names the quota reset time", () => {
    expect(
      getRelayFailureNotice(error("RELAY_QUOTA_EXCEEDED", 90_000))?.reason
    ).toContain("2 min");
  });
  it("ignores non-relay errors", () => {
    expect(getRelayFailureNotice(new Error("FEE_CREDIT_REQUIRED"))).toBeNull();
  });
});
