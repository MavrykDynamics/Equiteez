import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  BridgeReconciler,
  BRIDGE_POLL_INTERVAL,
  BRIDGE_POLL_LIMIT,
} from "./bridgeReconciler";
import { BridgeTransactions, bridgeNetwork } from "./bridgeTransactions";
import { deposit, localRecord } from "./bridgeTransactions.fixtures";
import type { BridgeDeposit } from "~/lib/apis/rwa/bridge/bridge.schema";

let store: BridgeTransactions;
beforeEach(() => {
  vi.useFakeTimers();
  store = new BridgeTransactions("wallet-a", bridgeNetwork, () => ({
    getItem: () => null,
    setItem: () => {},
  }));
});
afterEach(() => {
  vi.useRealTimers();
});
const flush = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

it("rejects an in-flight snapshot invalidated by an early event and coalesces refetches", async () => {
  let resolve!: (rows: BridgeDeposit[]) => void;
  const fetch = vi
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise<BridgeDeposit[]>((done) => {
          resolve = done;
        })
    )
    .mockResolvedValue([deposit({ status: "executed" })]);
  store.update(localRecord());
  const onSettlement = vi.fn();
  const tracker = new BridgeReconciler(store, fetch, onSettlement);
  tracker.setConnected(true);
  tracker.start();
  tracker.refresh();
  tracker.refresh();
  resolve([deposit()]);
  await flush();
  expect(fetch).toHaveBeenCalledTimes(2);
  expect(fetch.mock.calls.every((call) => call[2] === false)).toBe(true);
  expect(store.getSnapshot().transactions.get("operation-1")?.settlement).toBe(
    "executed"
  );
  expect(onSettlement).toHaveBeenCalledTimes(1);
  expect(vi.getTimerCount()).toBe(0);
  tracker.stop();
});

it("reconciles a reconnect gap and uses cold reads only without the socket", async () => {
  store.update(localRecord());
  const fetch = vi
    .fn()
    .mockResolvedValueOnce([deposit()])
    .mockResolvedValue([deposit({ status: "executed" })]);
  const tracker = new BridgeReconciler(store, fetch, vi.fn());
  tracker.start();
  await flush();
  expect(fetch.mock.calls[0][2]).toBe(true);
  tracker.setConnected(true);
  await flush();
  expect(fetch.mock.calls[1][2]).toBe(false);
  expect(store.getSnapshot().transactions.get("operation-1")?.settlement).toBe(
    "executed"
  );
  tracker.stop();
});

it("aborts old account work and rejects late fetch results even when transport ignores abort", async () => {
  let resolve!: (rows: BridgeDeposit[]) => void;
  const fetch = vi.fn().mockImplementation(
    () =>
      new Promise<BridgeDeposit[]>((done) => {
        resolve = done;
      })
  );
  let isCurrent = true;
  const settlement = vi.fn();
  const tracker = new BridgeReconciler(
    store,
    fetch,
    settlement,
    () => isCurrent
  );
  tracker.start();
  isCurrent = false;
  tracker.stop();
  expect((fetch.mock.calls[0][1] as AbortSignal).aborted).toBe(true);
  resolve([deposit({ status: "executed" })]);
  await flush();
  expect(store.getSnapshot().transactions.size).toBe(0);
  expect(settlement).not.toHaveBeenCalled();
  expect(vi.getTimerCount()).toBe(0);
});

it("rejects old generations across stop/start and resumes foreground recovery", async () => {
  let oldResolve!: (rows: BridgeDeposit[]) => void;
  const fetch = vi
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise<BridgeDeposit[]>((done) => {
          oldResolve = done;
        })
    )
    .mockResolvedValue([deposit({ status: "signing" })]);
  const tracker = new BridgeReconciler(store, fetch, vi.fn());
  tracker.start();
  tracker.stop();
  tracker.start();
  await flush();
  oldResolve([deposit()]);
  await flush();
  expect([...store.getSnapshot().transactions.values()][0].settlement).toBe(
    "signing"
  );
  tracker.stop();
  expect(vi.getTimerCount()).toBe(0);
});

it("bounds polling, retains unknown status on transport failures and restarts on recovery", async () => {
  store.update(localRecord());
  const fetch = vi.fn().mockRejectedValue(new Error("503"));
  const tracker = new BridgeReconciler(store, fetch, vi.fn());
  tracker.start();
  await flush();
  await vi.advanceTimersByTimeAsync(BRIDGE_POLL_INTERVAL * BRIDGE_POLL_LIMIT);
  expect(fetch).toHaveBeenCalledTimes(BRIDGE_POLL_LIMIT);
  expect(vi.getTimerCount()).toBe(0);
  expect(store.getSnapshot().transactions.get("operation-1")?.settlement).toBe(
    "unknown"
  );
  expect(store.getSnapshot().reconciliationError).toContain("paused");
  tracker.refresh();
  await flush();
  expect(fetch).toHaveBeenCalledTimes(BRIDGE_POLL_LIMIT + 1);
  tracker.stop();
});

it("stops periodic work for stalled rows but keeps event-triggered reconciliation available", async () => {
  const fetch = vi
    .fn()
    .mockResolvedValueOnce([deposit({ status: "stalled" })])
    .mockResolvedValue([deposit({ status: "executed" })]);
  const tracker = new BridgeReconciler(store, fetch, vi.fn());
  tracker.start();
  await flush();
  expect(vi.getTimerCount()).toBe(0);
  tracker.refresh();
  await flush();
  expect([...store.getSnapshot().transactions.values()][0].settlement).toBe(
    "executed"
  );
  tracker.stop();
});
