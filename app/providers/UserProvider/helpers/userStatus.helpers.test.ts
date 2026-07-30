import { describe, expect, it } from "vitest";

import { getIsKycedForAddress } from "./userStatus.helpers";

describe("getIsKycedForAddress", () => {
  it("returns true when the KYC response contains the active address", () => {
    expect(
      getIsKycedForAddress(
        {
          kyc_member: [{ user: { address: "mv1Verified" } }],
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
          kyc_member: [{ user: { address: "mv1Previous" } }],
        },
        "mv1Current"
      )
    ).toBe(false);
  });
});
