import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  forgetGoogleSignIn,
  hasPendingGoogleSignIn,
  rememberGoogleSignIn,
} from "./dynamicSocialReturn";

beforeEach(() => {
  const storage = new Map<string, string>();
  vi.stubGlobal("window", {
    sessionStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => void storage.set(key, value),
      removeItem: (key: string) => void storage.delete(key),
    },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Google sign-in note", () => {
  it("is pending after leaving for Google until forgotten", () => {
    expect(hasPendingGoogleSignIn()).toBe(false);

    rememberGoogleSignIn();
    expect(hasPendingGoogleSignIn()).toBe(true);

    forgetGoogleSignIn();
    expect(hasPendingGoogleSignIn()).toBe(false);
  });

  it("expires when the trip never finished", () => {
    rememberGoogleSignIn();

    expect(hasPendingGoogleSignIn(Date.now() + 11 * 60_000)).toBe(false);
    // The stale note is gone for good
    expect(hasPendingGoogleSignIn()).toBe(false);
  });
});
