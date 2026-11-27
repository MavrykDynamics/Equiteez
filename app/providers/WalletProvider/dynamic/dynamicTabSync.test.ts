import { afterEach, describe, expect, it, vi } from "vitest";

import {
  isDynamicKeyStale,
  doesLogoutReplaceSharedKey,
  isDynamicTabOutdated,
  markDynamicKeyFresh,
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
  ready = Promise.resolve() as Promise<unknown>,
} = {}) {
  const onOutdated = vi.fn();
  let own = ownExpiry;

  stopWatching = watchOtherTabsDynamicSessions({
    getOwnSessionExpiresAt: () => own,
    ready,
    onOutdated,
  });
  return {
    onOutdated,
    setOwnExpiry: (value: number | null) => {
      own = value;
    },
  };
}

afterEach(() => {
  stopWatching();
  resetDynamicTabSyncForTests();
});

describe("watchOtherTabsDynamicSessions", () => {
  it("ignores another tab that has the same session", async () => {
    const { onOutdated } = watch();

    await announceFromOtherTab(OWN_EXPIRY);

    expect(onOutdated).not.toHaveBeenCalled();
    expect(isDynamicTabOutdated()).toBe(false);
    expect(isDynamicKeyStale()).toBe(false);
  });

  it("is outdated, once, when another tab signs in with another session", async () => {
    const { onOutdated } = watch({ ownExpiry: null });

    await announceFromOtherTab(OWN_EXPIRY);
    await announceFromOtherTab(OWN_EXPIRY + 1);

    expect(onOutdated).toHaveBeenCalledTimes(1);
    expect(isDynamicTabOutdated()).toBe(true);
  });

  it("only marks the key stale when another tab signs out, without a reload", async () => {
    // A reloaded tab without a session would replace the key again
    const { onOutdated } = watch();

    await announceFromOtherTab(null);

    expect(onOutdated).not.toHaveBeenCalled();
    expect(isDynamicTabOutdated()).toBe(false);
    expect(isDynamicKeyStale()).toBe(true);

    markDynamicKeyFresh();
    expect(isDynamicKeyStale()).toBe(false);
  });

  it("marks the key stale while signed out when another tab replaces it", async () => {
    watch({ ownExpiry: null });

    await announceFromOtherTab(null);

    expect(isDynamicKeyStale()).toBe(true);
  });

  it("checks the latest message heard while its own SDK was starting once it has its session", async () => {
    let finishStarting: () => void = () => undefined;
    const ready = new Promise<void>((resolve) => {
      finishStarting = resolve;
    });
    const { onOutdated, setOwnExpiry } = watch({ ownExpiry: null, ready });

    // Heard before this tab read its own session
    await announceFromOtherTab(OWN_EXPIRY + 1);
    expect(onOutdated).not.toHaveBeenCalled();

    // It read a session that is not the other tab's
    setOwnExpiry(OWN_EXPIRY);
    finishStarting();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(onOutdated).toHaveBeenCalledTimes(1);
  });

  it("drops a message heard while starting when it read the same session", async () => {
    let finishStarting: () => void = () => undefined;
    const ready = new Promise<void>((resolve) => {
      finishStarting = resolve;
    });
    const { onOutdated, setOwnExpiry } = watch({ ownExpiry: null, ready });

    await announceFromOtherTab(OWN_EXPIRY);
    setOwnExpiry(OWN_EXPIRY);
    finishStarting();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(onOutdated).not.toHaveBeenCalled();
    expect(isDynamicKeyStale()).toBe(false);
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
