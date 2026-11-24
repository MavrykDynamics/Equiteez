import { describe, expect, it } from "vitest";

import { getSessionSyncAction, type SessionSyncInput } from "./sessionSync";

const signedIn: SessionSyncInput = {
  isWeb: true,
  isAuthLoading: false,
  isAuthenticated: true,
  isAuthFlowActive: false,
  isWalletBusy: false,
  accountAddress: "mv1A",
  authenticatedWalletAddress: "mv1A",
  hadWallet: true,
};

describe("getSessionSyncAction", () => {
  it("keeps a wallet whose RWA session matches", () => {
    expect(getSessionSyncAction(signedIn)).toBe("none");
  });

  it("disconnects a wallet that has no RWA session", () => {
    expect(
      getSessionSyncAction({
        ...signedIn,
        isAuthenticated: false,
        authenticatedWalletAddress: null,
      })
    ).toBe("disconnect-wallet");
  });

  it("logs out an RWA session of another address", () => {
    expect(getSessionSyncAction({ ...signedIn, accountAddress: "mv1B" })).toBe(
      "logout-rwa"
    );
  });

  it.each<[string, Partial<SessionSyncInput>]>([
    ["a sign-in is running", { isAuthFlowActive: true }],
    ["the wallet is still connecting", { isWalletBusy: true }],
    ["auth state is still loading", { isAuthLoading: true }],
    ["rendering on the server", { isWeb: false }],
  ])("does nothing while %s", (_, overrides) => {
    // The email wallet appears before login() finishes: not a mismatch
    const connectingEmailWallet = {
      ...signedIn,
      isAuthenticated: false,
      authenticatedWalletAddress: null,
      ...overrides,
    };

    expect(getSessionSyncAction(connectingEmailWallet)).toBe("none");
    expect(
      getSessionSyncAction({
        ...signedIn,
        accountAddress: "mv1B",
        ...overrides,
      })
    ).toBe("none");
  });

  it("logs out an RWA session when the restore on load reopened no wallet", () => {
    // E.g. the email wallet's session expired
    expect(
      getSessionSyncAction({
        ...signedIn,
        accountAddress: null,
        hadWallet: null,
      })
    ).toBe("logout-rwa");
  });

  it("logs out an RWA session when this tab loses its wallet", () => {
    // E.g. Dynamic signed out while the tab was open
    expect(
      getSessionSyncAction({
        ...signedIn,
        accountAddress: null,
        hadWallet: true,
      })
    ).toBe("logout-rwa");
  });

  it("keeps an RWA session another tab signed in while this tab had no wallet", () => {
    // Tokens are shared: logging out here would end the other tab's sign-in
    expect(
      getSessionSyncAction({
        ...signedIn,
        accountAddress: null,
        hadWallet: false,
      })
    ).toBe("none");
  });

  it("does nothing without a wallet or an RWA session", () => {
    expect(
      getSessionSyncAction({
        ...signedIn,
        accountAddress: null,
        isAuthenticated: false,
      })
    ).toBe("none");
  });
});
