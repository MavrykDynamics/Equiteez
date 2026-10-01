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
    act(() => root.render(<RTradingCountdown startsAt={start + 86400000} />));
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

  it("hides past timestamps and resets cleanly when the start changes", () => {
    act(() => root.render(<RTradingCountdown startsAt={start - 1} />));
    expect(container.innerHTML).toBe("");
    expect(vi.getTimerCount()).toBe(0);

    act(() => root.render(<RTradingCountdown startsAt={start + 60000} />));
    expect(container.textContent).toContain("Token Sale Starts Soon");
    expect(vi.getTimerCount()).toBe(1);
    act(() => root.render(<RTradingCountdown startsAt={start + 120000} />));
    expect(vi.getTimerCount()).toBe(1);
    act(() => root.render(null));
    expect(vi.getTimerCount()).toBe(0);
  });
});
