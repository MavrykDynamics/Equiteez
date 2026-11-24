// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";

import { reloadWhenHidden } from "./reloadWhenHidden";

function setVisibility(state: DocumentVisibilityState) {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get: () => state,
  });
}

afterEach(() => {
  setVisibility("visible");
});

describe("reloadWhenHidden", () => {
  it("reloads a hidden tab at once", () => {
    const reload = vi.fn();
    setVisibility("hidden");

    reloadWhenHidden(document, reload);

    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("waits until a visible tab is hidden, then reloads once", () => {
    const reload = vi.fn();
    setVisibility("visible");

    reloadWhenHidden(document, reload);
    expect(reload).not.toHaveBeenCalled();

    setVisibility("hidden");
    document.dispatchEvent(new Event("visibilitychange"));
    document.dispatchEvent(new Event("visibilitychange"));

    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("does not reload once cancelled", () => {
    const reload = vi.fn();
    setVisibility("visible");

    const cancel = reloadWhenHidden(document, reload);
    cancel();
    setVisibility("hidden");
    document.dispatchEvent(new Event("visibilitychange"));

    expect(reload).not.toHaveBeenCalled();
  });
});
