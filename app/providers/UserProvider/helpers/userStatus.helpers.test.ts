import { describe, expect, it } from "vitest";

import {
  getHasOrdersForAddress,
  getIsKycedForAddress,
  getKycDatesForAddress,
} from "./userStatus.helpers";

describe("getKycDatesForAddress", () => {
  it("returns the membership dates of the active address only", () => {
    const data = {
      kyc_member: [
        {
          updated_at: "2026-10-01T00:00:00Z",
          expire_at: "2027-10-01T00:00:00Z",
          user: { address: "mv1Previous", orderbook_order_events: [] },
        },
        {
          updated_at: "2026-11-01T10:00:00Z",
          expire_at: null,
          user: { address: "mv1Verified", orderbook_order_events: [] },
        },
      ],
    };

    expect(getKycDatesForAddress(data, "mv1Verified")).toEqual({
      verifiedAt: "2026-11-01T10:00:00Z",
      expiresAt: null,
    });
    expect(getKycDatesForAddress(data, "mv1Other")).toEqual({
      verifiedAt: null,
      expiresAt: null,
    });
  });
});

describe("getIsKycedForAddress", () => {
  it("returns true when the KYC response contains the active address", () => {
    expect(
      getIsKycedForAddress(
        {
          kyc_member: [
            {
              updated_at: "2026-11-01T10:00:00Z",
              user: {
                address: "mv1Verified",
                orderbook_order_events: [],
              },
            },
          ],
        },
        "mv1Verified"
      )
    ).toBe(true);
  });

  it("returns false when the active address has no KYC row", () => {
    expect(
      getIsKycedForAddress(
        {
          kyc_member: [],
        },
        "mv1Unverified"
      )
    ).toBe(false);
  });

  it("ignores rows for a previous wallet address", () => {
    expect(
      getIsKycedForAddress(
        {
          kyc_member: [
            {
              updated_at: "2026-11-01T10:00:00Z",
              user: {
                address: "mv1Previous",
                orderbook_order_events: [],
              },
            },
          ],
        },
        "mv1Current"
      )
    ).toBe(false);
  });
});

describe("getHasOrdersForAddress", () => {
  it("returns false when the matching user has an empty order history", () => {
    expect(
      getHasOrdersForAddress(
        {
          kyc_member: [
            {
              updated_at: "2026-11-01T10:00:00Z",
              user: {
                address: "mv1NoOrders",
                orderbook_order_events: [],
              },
            },
          ],
        },
        "mv1NoOrders"
      )
    ).toBe(false);
  });

  it("returns true when the matching user has order history", () => {
    expect(
      getHasOrdersForAddress(
        {
          kyc_member: [
            {
              updated_at: "2026-11-01T10:00:00Z",
              user: {
                address: "mv1HasOrders",
                orderbook_order_events: [{ counter: 1 }],
              },
            },
          ],
        },
        "mv1HasOrders"
      )
    ).toBe(true);
  });

  it("ignores order history for a previous wallet address", () => {
    expect(
      getHasOrdersForAddress(
        {
          kyc_member: [
            {
              updated_at: "2026-11-01T10:00:00Z",
              user: {
                address: "mv1Previous",
                orderbook_order_events: [{ counter: 1 }],
              },
            },
          ],
        },
        "mv1Current"
      )
    ).toBe(false);
  });
});
