// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RTradingCountdown } from "./RTradingCountdown";

describe("RTradingCountdown", () => {
  let container: HTMLDivElement;
  let root: Root;
  const start = Date.parse("2026-09-30T12:00:00Z");

  beforeEach(() => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    vi.useFakeTimers();
    vi.setSystemTime(start);
    container = document.createElement("div");
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("rolls over days and hours and catches up after a clock jump", () => {
    act(() =>
      root.render(
        <RTradingCountdown
          saleStart={new Date(start + 86400000).toISOString()}
          saleEnd={new Date(start + 172800000).toISOString()}
        />
      )
    );
    expect(
      container.querySelector('[role="timer"]')?.getAttribute("aria-label")
    ).toBe("Trading starts in 1 days, 0 hours, 0 minutes, 0 seconds");

    act(() => vi.advanceTimersByTime(1000));
    expect(
      container.querySelector('[role="timer"]')?.getAttribute("aria-label")
    ).toBe("Trading starts in 0 days, 23 hours, 59 minutes, 59 seconds");

    vi.setSystemTime(start + 86398000);
    act(() => vi.advanceTimersByTime(1000));
    expect(
      container.querySelector('[role="timer"]')?.getAttribute("aria-label")
    ).toBe("Trading starts in 0 days, 0 hours, 0 minutes, 1 seconds");
    act(() => vi.advanceTimersByTime(1000));
    expect(container.innerHTML).toBe("");
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([
    [undefined, undefined],
    ["invalid", "2027-09-28T08:09:25Z"],
    ["2026-10-01T00:00:00Z", null],
    ["2026-10-01T00:00:00Z", "invalid"],
    ["2026-10-01T00:00:00Z", "2026-09-29T00:00:00Z"],
    ["2026-10-01T00:00:00Z", "2026-10-01T00:00:00Z"],
  ])("hides invalid windows (%s, %s)", (saleStart, saleEnd) => {
    act(() =>
      root.render(<RTradingCountdown saleStart={saleStart} saleEnd={saleEnd} />)
    );
    expect(container.innerHTML).toBe("");
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each([0, 1000, 2000, 3000])(
    "hides at/after start including sale end (+%s ms)",
    (elapsed) => {
      vi.setSystemTime(start + elapsed);
      act(() =>
        root.render(
          <RTradingCountdown
            saleStart={new Date(start).toISOString()}
            saleEnd={new Date(start + 2000).toISOString()}
          />
        )
      );
      expect(container.innerHTML).toBe("");
      expect(vi.getTimerCount()).toBe(0);
    }
  );

  it("hides past timestamps and resets cleanly when the start changes", () => {
    act(() =>
      root.render(
        <RTradingCountdown
          saleStart={new Date(start - 1).toISOString()}
          saleEnd={new Date(start + 172800000).toISOString()}
        />
      )
    );
    expect(container.innerHTML).toBe("");
    expect(vi.getTimerCount()).toBe(0);

    act(() =>
      root.render(
        <RTradingCountdown
          saleStart={new Date(start + 60000).toISOString()}
          saleEnd={new Date(start + 172800000).toISOString()}
        />
      )
    );
    expect(container.textContent).toContain("Token Sale Starts Soon");
    expect(vi.getTimerCount()).toBe(1);
    act(() =>
      root.render(
        <RTradingCountdown
          saleStart={new Date(start + 120000).toISOString()}
          saleEnd={new Date(start + 172800000).toISOString()}
        />
      )
    );
    expect(vi.getTimerCount()).toBe(1);
    act(() => root.render(null));
    expect(vi.getTimerCount()).toBe(0);
  });
});
