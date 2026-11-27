import { afterEach, describe, expect, it, vi } from "vitest";

import { isDynamicDirectEnabled } from "./dynamic.config";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("isDynamicDirectEnabled", () => {
  it("is off when unset", () => {
    vi.stubEnv("DYNAMIC_DIRECT_ENABLED", "");
    expect(isDynamicDirectEnabled("orderbook.buy")).toBe(false);
  });

  it("enables every gated action with true", () => {
    vi.stubEnv("DYNAMIC_DIRECT_ENABLED", "true");
    expect(isDynamicDirectEnabled("withdraw")).toBe(true);
  });

  it("enables only the listed actions", () => {
    vi.stubEnv(
      "DYNAMIC_DIRECT_ENABLED",
      " orderbook.buy, orderbook.sell ,orderbook.cancel"
    );
    expect(isDynamicDirectEnabled("orderbook.sell")).toBe(true);
    expect(isDynamicDirectEnabled("withdraw")).toBe(false);
  });
});
