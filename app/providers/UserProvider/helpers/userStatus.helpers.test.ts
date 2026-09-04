import { describe, expect, it } from "vitest";

import {
  getHasOrdersForAddress,
  getIsKycedForAddress,
} from "./userStatus.helpers";

describe("getIsKycedForAddress", () => {
  it("returns true when the KYC response contains the active address", () => {
    expect(
      getIsKycedForAddress(
        {
          kyc_member: [
            {
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
