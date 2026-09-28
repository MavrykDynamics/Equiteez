import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { WidgetRemovals } from "./widgetRemovals";

let data: Map<string, string>;
let stores: WidgetRemovals[];
const storage = () => ({
  getItem: (key: string) => data.get(key) ?? null,
  setItem: (key: string, value: string) => {
    data.set(key, value);
  },
});
function start(account = "wallet-a", network = "network-a") {
  const store = new WidgetRemovals(account, network, storage);
  stores.push(store);
  store.start();
  return store;
}
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(10_000);
  data = new Map();
  stores = [];
});
afterEach(() => {
  stores.forEach((store) => store.stop());
  expect(vi.getTimerCount()).toBe(0);
  vi.useRealTimers();
});

it("expires concurrent successes independently and duplicates never restart deadlines", () => {
  const store = start();
  store.confirmSuccess("hash:32");
  vi.advanceTimersByTime(2_000);
  store.confirmSuccess("hash:33");
  store.confirmSuccess("hash:32");
  vi.advanceTimersByTime(3_000);
  expect(store.getSnapshot().entries.get("hash:32")).toBeNull();
  expect(store.getSnapshot().entries.get("hash:33")).toBe(17_000);
  vi.advanceTimersByTime(2_000);
  expect(store.getSnapshot().entries.get("hash:33")).toBeNull();
  store.confirmSuccess("hash:32");
  expect(vi.getTimerCount()).toBe(0);
});

it("retains original deadlines on reload and removal markers across wallet sessions", () => {
  const store = start();
  store.confirmSuccess("hash:32");
  vi.advanceTimersByTime(2_000);
  store.stop();
  const restored = start();
  restored.confirmSuccess("hash:32");
  expect(restored.getSnapshot().entries.get("hash:32")).toBe(15_000);
  restored.stop();
  vi.setSystemTime(20_000);
  expect(start().getSnapshot().entries.get("hash:32")).toBeNull();
  expect(start("wallet-b").getSnapshot().entries.size).toBe(0);
  expect(start("wallet-a", "network-b").getSnapshot().entries.size).toBe(0);
});

it("dismisses one deposit and expires overdue deadlines immediately on foreground", () => {
  const store = start();
  store.confirmSuccess("hash:32");
  store.confirmSuccess("hash:33");
  store.dismiss("hash:32");
  expect(store.getSnapshot().entries.get("hash:33")).toBe(15_000);
  vi.setSystemTime(30_000);
  store.expire();
  expect([...store.getSnapshot().entries.values()]).toEqual([null, null]);
  expect(vi.getTimerCount()).toBe(0);
});

it("preserves removals written by another tab", () => {
  const first = start();
  const second = start();
  first.dismiss("hash:32");
  second.confirmSuccess("hash:33");
  expect(second.getSnapshot().entries.get("hash:32")).toBeNull();
  expect(start().getSnapshot().entries.size).toBe(2);
});

it("preserves corrupt history and reports storage failures without stopping session expiry", () => {
  start().stop();
  const key = "equiteez:bridge-widgets:v1:network-a:wallet-a";
  data.set(key, "broken");
  const store = start();
  expect(store.getSnapshot().storageError).toContain("could not be read");
  store.confirmSuccess("hash:32");
  vi.advanceTimersByTime(5_000);
  expect(store.getSnapshot().entries.get("hash:32")).toBeNull();
  expect(data.get(key)).toBe("broken");
});
