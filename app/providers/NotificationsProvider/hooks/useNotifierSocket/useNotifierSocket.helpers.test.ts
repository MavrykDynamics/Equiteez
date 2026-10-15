// @vitest-environment jsdom
import { expect, it, vi } from "vitest";
import { getReconnectDelay, isOnline, isSocketAlive, isSocketDead, parseNotifierServerFrame } from "./useNotifierSocket.helpers";

it("recognizes socket lifecycle states", () => {
  expect(isSocketAlive({ readyState: 0 } as WebSocket)).toBe(true);
  expect(isSocketAlive({ readyState: 1 } as WebSocket)).toBe(true);
  expect(isSocketAlive({ readyState: 3 } as WebSocket)).toBe(false);
  expect(isSocketDead(null)).toBe(true);
  expect(isSocketDead({ readyState: 2 } as WebSocket)).toBe(true);
});
it("bounds reconnect jitter by exponential backoff", () => {
  vi.spyOn(Math, "random").mockReturnValue(0.5);
  expect(getReconnectDelay(0)).toBe(500);
  expect(getReconnectDelay(20)).toBe(15_000);
  vi.restoreAllMocks();
});
it("parses valid notifier frames and rejects malformed data", () => {
  expect(parseNotifierServerFrame(JSON.stringify({ type: "auth_ok", wallet: "wallet-a" }))).toMatchObject({ type: "auth_ok", wallet: "wallet-a" });
  expect(parseNotifierServerFrame(JSON.stringify({ type: "event", event_id: "id", event_type: "UPDATE", occurred_at: "2026-01-01T00:00:00Z", channel: "wallet", payload: {} }))).toMatchObject({ type: "event", event_id: "id" });
  expect(parseNotifierServerFrame("not-json")).toBeNull();
  expect(parseNotifierServerFrame(JSON.stringify({ type: "event", event_id: "", channel: "wallet" }))).toBeNull();
  expect(parseNotifierServerFrame({ type: "pong" })).toBeNull();
});
it("uses the browser online flag when available", () => {
  Object.defineProperty(navigator, "onLine", { configurable: true, value: false });
  expect(isOnline()).toBe(false);
});
