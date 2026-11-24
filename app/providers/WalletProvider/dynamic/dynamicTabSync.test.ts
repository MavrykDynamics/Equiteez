import { afterEach, describe, expect, it, vi } from "vitest";

import {
  areDynamicKeysStale,
  doesLogoutReplaceSharedKey,
  isDynamicTabOutdated,
  markDynamicKeysFresh,
  resetDynamicTabSyncForTests,
  watchOtherTabsDynamicSessions,
} from "./dynamicTabSync";

const CHANNEL_NAME = "equiteez:dynamic-session";
const OWN_EXPIRY = 1_800_000_000_000;

/** A message as another tab sends it */
async function announceFromOtherTab(sessionExpiresAt: number | null) {
  const channel = new BroadcastChannel(CHANNEL_NAME);

  channel.postMessage({ tabId: "other-tab", sessionExpiresAt });
  channel.close();
  // Delivery is asynchronous
  await new Promise((resolve) => setTimeout(resolve, 20));
}

let stopWatching: () => void = () => undefined;

function watch({
  ownExpiry = OWN_EXPIRY as number | null,
  isReady = true,
} = {}) {
  const onOutdated = vi.fn();

  stopWatching = watchOtherTabsDynamicSessions({
    getOwnSessionExpiresAt: () => ownExpiry,
    isReady: () => isReady,
    onOutdated,
  });
  return onOutdated;
}

afterEach(() => {
  stopWatching();
  resetDynamicTabSyncForTests();
});

describe("watchOtherTabsDynamicSessions", () => {
  it("ignores another tab that has the same session", async () => {
    const onOutdated = watch();

    await announceFromOtherTab(OWN_EXPIRY);

    expect(onOutdated).not.toHaveBeenCalled();
    expect(isDynamicTabOutdated()).toBe(false);
    expect(areDynamicKeysStale()).toBe(false);
  });

  it("is outdated, once, when another tab signs in with another session", async () => {
    const onOutdated = watch({ ownExpiry: null });

    await announceFromOtherTab(OWN_EXPIRY);
    await announceFromOtherTab(OWN_EXPIRY + 1);

    expect(onOutdated).toHaveBeenCalledTimes(1);
    expect(isDynamicTabOutdated()).toBe(true);
  });

  it("only marks the key stale when another tab signs out, without a reload", async () => {
    // A reloaded tab without a session would replace the key again
    const onOutdated = watch();

    await announceFromOtherTab(null);

    expect(onOutdated).not.toHaveBeenCalled();
    expect(isDynamicTabOutdated()).toBe(false);
    expect(areDynamicKeysStale()).toBe(true);

    markDynamicKeysFresh();
    expect(areDynamicKeysStale()).toBe(false);
  });

  it("marks the key stale while signed out when another tab replaces it", async () => {
    watch({ ownExpiry: null });

    await announceFromOtherTab(null);

    expect(areDynamicKeysStale()).toBe(true);
  });

  it("ignores messages while its own SDK is still starting", async () => {
    const onOutdated = watch({ isReady: false });

    await announceFromOtherTab(OWN_EXPIRY + 1);
    await announceFromOtherTab(null);

    expect(onOutdated).not.toHaveBeenCalled();
    expect(areDynamicKeysStale()).toBe(false);
  });
});

describe("doesLogoutReplaceSharedKey", () => {
  it("is false only when the SDK keeps the key another tab owns", () => {
    expect(doesLogoutReplaceSharedKey("keychain-session-key-mismatch")).toBe(
      false
    );
    expect(doesLogoutReplaceSharedKey("token-expired")).toBe(true);
    expect(doesLogoutReplaceSharedKey("user-intent")).toBe(true);
    expect(doesLogoutReplaceSharedKey(null)).toBe(true);
  });
});
