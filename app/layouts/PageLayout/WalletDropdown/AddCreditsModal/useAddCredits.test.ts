import { describe, expect, it, vi } from "vitest";
import { RelayApiError } from "~/lib/relay/relay.errors";

vi.mock("~/contracts/permit", () => ({}));
vi.mock("~/providers/GasPaymentProvider/GasPaymentProvider", () => ({}));
vi.mock("~/providers/RelayProvider/RelayProvider", () => ({}));

import { getTopUpErrorMessage } from "./useAddCredits";

describe("getTopUpErrorMessage", () => {
  it("asks for a new signature after an expired deadline", () => {
    expect(
      getTopUpErrorMessage(new RelayApiError(400, "PERMIT_EXPIRED", "re-sign"))
    ).toContain("sign a new request");
  });
  it("never claims a lost or failed response was refused", () => {
    for (const status of [undefined, 503])
      expect(
        getTopUpErrorMessage(
          new RelayApiError(status, "RELAY_UNAVAILABLE", "retry")
        )
      ).toContain("don't add Gas Credits again");
  });
  it("sends a saved MVRK preference to payment settings", () => {
    expect(
      getTopUpErrorMessage(
        new RelayApiError(409, "PAYMENT_METHOD_MISMATCH", "give-up")
      )
    ).toContain("Payment settings");
  });
  it("uses the server message for other refusals", () => {
    expect(
      getTopUpErrorMessage(
        new RelayApiError(
          400,
          "INVALID_REQUEST",
          "give-up",
          undefined,
          0,
          undefined,
          "deadline is malformed"
        )
      )
    ).toBe("deadline is malformed");
  });
});
