// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { RelayApiError } from "~/lib/relay/relay.errors";

const mocks = vi.hoisted(() => ({
  prepare: vi.fn(),
  sign: vi.fn(),
  submitTopUp: vi.fn(),
  price: "1000000",
}));
vi.mock("~/contracts/permit", () => ({
  preparePermit: mocks.prepare,
  signPreparedPermit: mocks.sign,
}));
vi.mock("~/providers/GasPaymentProvider/GasPaymentProvider", () => ({
  useGasPayment: () => ({ reload: vi.fn(), scope: "scope" }),
}));
vi.mock("~/providers/RelayProvider/RelayProvider", () => ({
  useRelay: () => ({
    isReady: true,
    isLocked: () => false,
    submitTopUp: mocks.submitTopUp,
    runtime: {
      refreshConfig: async () => ({
        enabled: true,
        fee: {
          enabled: true,
          tokenContract: "quote",
          decimals: 6,
          feeSchedule: {
            permitPlaceBuyOrder: mocks.price,
            permitPlaceSellOrder: mocks.price,
          },
        },
      }),
    },
  }),
}));

import { getTopUpErrorMessage, useAddCredits } from "./useAddCredits";

function renderAddCredits() {
  let addCredits!: ReturnType<typeof useAddCredits>;
  function Probe() {
    addCredits = useAddCredits();
    return null;
  }
  (
    globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
  ).IS_REACT_ACT_ENVIRONMENT = true;
  const root = createRoot(document.createElement("div"));
  act(() =>
    root.render(
      createElement(
        QueryClientProvider,
        { client: new QueryClient() },
        createElement(Probe)
      )
    )
  );
  return addCredits;
}

describe("useAddCredits", () => {
  it("signs the exact reviewed amount", async () => {
    mocks.price = "1000000";
    mocks.prepare.mockResolvedValue("prepared");
    mocks.sign.mockResolvedValue("signed");
    const addCredits = renderAddCredits();
    await addCredits({
      amountUnits: "20000000",
      reviewedPriceUnits: "1000000",
    });
    expect(mocks.prepare).toHaveBeenCalledWith(expect.anything(), {
      kind: "fee_top_up",
      amountUnits: "20000000",
    });
    expect(mocks.submitTopUp).toHaveBeenCalledWith("signed");
  });
  it("refuses to sign a preset when the Credit price changed after review", async () => {
    mocks.price = "500000";
    mocks.prepare.mockClear();
    const addCredits = renderAddCredits();
    await expect(
      addCredits({ amountUnits: "20000000", reviewedPriceUnits: "1000000" })
    ).rejects.toThrow("price changed");
    expect(mocks.prepare).not.toHaveBeenCalled();
  });
});

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
