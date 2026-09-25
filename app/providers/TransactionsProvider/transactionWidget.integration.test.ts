import { afterEach, expect, it, vi } from "vitest";
import {
  BridgeTransactions,
  bridgeNetwork,
  withBridgeProgress,
} from "./bridgeTransactions";
import { BridgeReconciler } from "./bridgeReconciler";
import {
  deposit,
  localRecord,
  replacementHash,
} from "./bridgeTransactions.fixtures";
import {
  createWidgetPresentation,
  reconcileWidgetPresentation,
  toTransactionWidget,
} from "./transactionWidget.helpers";

const flush = async () => {
  await Promise.resolve();
  await Promise.resolve();
};
afterEach(() => vi.useRealTimers());
it("external invalidations reconcile cards in place, preserve dismissal and recover to success", async () => {
  vi.useFakeTimers();
  const store = new BridgeTransactions("wallet-a", bridgeNetwork, () => ({
    getItem: () => null,
    setItem: () => {},
  }));
  const fetch = vi.fn().mockResolvedValue([]);
  const settlement = vi.fn();
  const reconciler = new BridgeReconciler(store, fetch, settlement);
  let presentation = createWidgetPresentation(store);
  const read = () => {
    const models = [...store.getSnapshot().transactions.values()].flatMap(
      (record) => {
        const model = toTransactionWidget(record);
        return model ? [model] : [];
      }
    );
    presentation = reconcileWidgetPresentation(presentation, store, models);
    return models;
  };
  reconciler.start();
  await flush();
  expect(read()).toHaveLength(0);
  fetch.mockResolvedValue([
    deposit({ status: "signing" }),
    deposit({ log_index: 2 }),
  ]);
  reconciler.refresh();
  await flush();
  const first = read();
  expect(first).toHaveLength(2);
  expect(first[0].state).toMatchObject({ status: "progress", step: 2 });
  expect(presentation.isOpen).toBe(true);
  presentation = {
    ...presentation,
    dismissed: new Set([first[0].operationId]),
    isOpen: false,
  };
  reconciler.refresh();
  await flush();
  expect(read().map((item) => item.operationId)).toEqual(
    first.map((item) => item.operationId)
  );
  expect(presentation.isOpen).toBe(false);
  fetch.mockRejectedValue(new Error("HTTP unavailable"));
  reconciler.refresh();
  await flush();
  expect(read().every((item) => item.state.status === "warning")).toBe(true);
  fetch.mockResolvedValue([
    deposit({ status: "executed" }),
    deposit({ log_index: 2, status: "executed" }),
  ]);
  reconciler.refresh();
  await flush();
  expect(read().every((item) => item.state.status === "success")).toBe(true);
  expect(presentation.dismissed.has(first[0].operationId)).toBe(true);
  const calls = settlement.mock.calls.length;
  read();
  read();
  reconciler.refresh();
  await flush();
  expect(settlement).toHaveBeenCalledTimes(calls);
  reconciler.stop();
  expect(vi.getTimerCount()).toBe(0);
});

it("canonical replacement adoption migrates dismissal from backend to local operation", () => {
  const store = new BridgeTransactions("wallet-a", bridgeNetwork, () => ({
    getItem: () => null,
    setItem: () => {},
  }));
  store.reconcile([deposit({ evm_tx_hash: replacementHash })]);
  const early = toTransactionWidget(
    [...store.getSnapshot().transactions.values()][0]
  )!;
  let state = reconcileWidgetPresentation(
    createWidgetPresentation(store),
    store,
    [early]
  );
  state = { ...state, dismissed: new Set([early.operationId]), isOpen: false };
  store.update(
    withBridgeProgress(localRecord(), {
      step: "lock",
      status: "confirming",
      hash: replacementHash,
    })
  );
  const adopted = toTransactionWidget(
    [...store.getSnapshot().transactions.values()][0]
  )!;
  state = reconcileWidgetPresentation(state, store, [adopted]);
  expect(adopted.operationId).toBe("operation-1");
  expect(state.dismissed.has(adopted.operationId)).toBe(true);
  expect(state.isOpen).toBe(false);
});

it("distinguishes a healthy source handoff from unavailable, restored and exhausted tracking", async () => {
  vi.useFakeTimers();
  const store = new BridgeTransactions("wallet-a", bridgeNetwork, () => ({
    getItem: () => null,
    setItem: () => {},
  }));
  store.update(
    withBridgeProgress(localRecord(), { step: "lock", status: "confirmed" })
  );
  const read = () =>
    toTransactionWidget(
      store.getSnapshot().transactions.get("operation-1")!,
      store.getSnapshot()
    )!.state;
  const fetch = vi.fn().mockResolvedValue([]);
  const settlement = vi.fn();
  const tracker = new BridgeReconciler(store, fetch, settlement);
  tracker.start();
  await flush();
  expect(read()).toMatchObject({
    status: "waiting",
    description: expect.stringContaining("not yet verified"),
  });
  expect(settlement).not.toHaveBeenCalled();
  fetch.mockRejectedValue(new Error("unavailable"));
  tracker.refresh();
  await flush();
  expect(read().status).toBe("warning");
  fetch.mockResolvedValue([]);
  tracker.refresh();
  await flush();
  expect(read().status).toBe("waiting");
  store.markStale("Automatic status checks paused.");
  expect(read().status).toBe("warning");
  const record = store.getSnapshot().transactions.get("operation-1")!;
  expect(
    toTransactionWidget(
      { ...record, verification: "unverified" },
      { lastCheckedAt: Date.now() }
    )!.state.status
  ).toBe("warning");
  fetch.mockResolvedValue([deposit()]);
  tracker.refresh();
  await flush();
  expect(read()).toMatchObject({
    status: "progress",
    title: "Waiting for the bridge",
  });
  fetch.mockResolvedValue([deposit({ status: "executed" })]);
  tracker.refresh();
  await flush();
  expect(read().status).toBe("success");
  expect(settlement).toHaveBeenCalledTimes(1);
  tracker.stop();
  expect(vi.getTimerCount()).toBe(0);
});
