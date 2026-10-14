import { QueryClient } from "@tanstack/react-query";
import { beforeEach, expect, it, vi } from "vitest";
import { BridgeTransactions, bridgeNetwork } from "./bridgeTransactions";
import {
  deposit,
  localRecord,
  signerEventSequence,
} from "./bridgeTransactions.fixtures";
import { recoverBridgeWidgets } from "./bridgeWidgetRecovery";
import type {
  NotificationItemType,
  NotificationsResponseType,
} from "~/lib/apis/rwa/notifications/notifications.types";

const { fetchNotifications } = vi.hoisted(() => ({
  fetchNotifications: vi.fn(),
}));
vi.mock("~/lib/apis/rwa/notifications/notifications", () => ({
  fetchWalletNotifications: fetchNotifications,
}));
const completion = (payload = {}): NotificationItemType => ({
  id: "completion",
  event_id: null,
  event_type: "BRIDGE_DEPOSIT_UPDATED",
  kind: "bridge_deposit_completed",
  entity_key: "bridge:deposit",
  payload: { ...signerEventSequence[4], ...payload },
  occurred_at: "2026-09-25T12:07:00Z",
  created_at: "2026-09-25T12:07:00Z",
  read_at: "2026-09-26T12:07:00Z",
});
const page = (
  items: NotificationItemType[] = [],
  next_cursor: string | null = null
): NotificationsResponseType => ({
  items,
  next_cursor,
  unread_count: 0,
  unread_capped: false,
});
function setup() {
  const data = new Map<string, string>();
  const storage = () => ({
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
  });
  const original = new BridgeTransactions("wallet-a", bridgeNetwork, storage);
  original.update({ ...localRecord(), isWidgetRequested: true });
  original.observeEvent(signerEventSequence[0]);
  original.observeEvent(signerEventSequence[2]);
  const store = new BridgeTransactions("wallet-a", bridgeNetwork, storage);
  store.restore();
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  const controller = new AbortController();
  const recover = () =>
    recoverBridgeWidgets(store, client, controller.signal, () => true);
  const record = () => store.getSnapshot().transactions.get("operation-1")!;
  return { store, client, controller, recover, record, storage };
}
beforeEach(() => {
  fetchNotifications.mockReset().mockResolvedValue(page());
});

it("uses cached read notifications and persists suppression across reconnect and WSS replay", async () => {
  const { store, client, recover, record, storage } = setup();
  client.setQueryData(["walletNotificationsPage", "wallet-a", 0], {
    pages: [page([completion()])],
    pageParams: [undefined],
  });
  await recover();
  expect(fetchNotifications).not.toHaveBeenCalled();
  expect(record().widgetRecovery).toBe("suppressed");
  expect(record().signerEvents).toHaveLength(2);
  store.observeEvent(signerEventSequence[3]);
  const restored = new BridgeTransactions("wallet-a", bridgeNetwork, storage);
  restored.restore();
  expect(
    restored.getSnapshot().transactions.get("operation-1")?.widgetRecovery
  ).toBe("suppressed");
});

it("finds a one-day-old completion beyond multiple pages without a preview or age cutoff", async () => {
  const { client, recover, record } = setup();
  client.setQueryData(
    ["rwa-wallet-notifications", "wallet-a", 5],
    page(
      Array.from({ length: 5 }, () => ({
        ...completion(),
        kind: "order_filled",
      })),
      "preview-next"
    )
  );
  fetchNotifications
    .mockResolvedValueOnce(
      page([completion({ initial_log_index: 99 })], "older-1")
    )
    .mockResolvedValueOnce(page([], "older-2"))
    .mockResolvedValueOnce(page([completion()], "still-older"));
  await recover();
  expect(fetchNotifications).toHaveBeenCalledTimes(3);
  expect(fetchNotifications.mock.calls.map(([args]) => args.cursor)).toEqual([
    undefined,
    "older-1",
    "older-2",
  ]);
  expect(fetchNotifications.mock.calls[0][0]).toMatchObject({
    kinds: ["bridge_deposit_completed"],
    limit: 100,
  });
  expect(record().widgetRecovery).toBe("suppressed");
});

it("rejects another wallet, log, hash, direction, malformed identity and non-completion kinds", async () => {
  const { client, recover, record } = setup();
  client.setQueryData(
    ["rwa-wallet-notifications", "wallet-b", 5],
    page([completion()])
  );
  fetchNotifications.mockResolvedValue(
    page([
      completion({ mavryk_address: "wallet-b" }),
      completion({ initial_log_index: 99 }),
      completion({ initial_tx_hash: `0x${"c".repeat(64)}` }),
      completion({ direction: "out" }),
      completion({ initial_log_index: "32" }),
      { ...completion(), kind: "bridge_deposit_stalled" },
    ])
  );
  await recover();
  expect(record().widgetRecovery).toBe("ready");
  expect(record().signerEvents).toHaveLength(2);
});

it("joins an in-flight preview without fetching additional history", async () => {
  const { client, recover, record } = setup();
  let resolve!: (value: NotificationsResponseType) => void;
  const preview = client.fetchQuery({
    queryKey: ["rwa-wallet-notifications", "wallet-a", 5],
    queryFn: () =>
      new Promise<NotificationsResponseType>((done) => {
        resolve = done;
      }),
  });
  const recovery = recover();
  resolve(page([completion()]));
  await Promise.all([preview, recovery]);
  expect(fetchNotifications).not.toHaveBeenCalled();
  expect(record().widgetRecovery).toBe("suppressed");
});

it("keeps recovery pending on errors and can retry", async () => {
  const { recover, record } = setup();
  fetchNotifications.mockRejectedValueOnce(new Error("offline"));
  await expect(recover()).rejects.toThrow("offline");
  expect(record().widgetRecovery).toBe("pending");
  fetchNotifications.mockResolvedValueOnce(page([completion()]));
  await recover();
  expect(record().widgetRecovery).toBe("suppressed");
});

it("does not let a response from a disconnected session modify its store", async () => {
  const { controller, recover, record } = setup();
  fetchNotifications.mockImplementationOnce(async () => {
    controller.abort();
    return page([completion()]);
  });
  await recover();
  expect(record().widgetRecovery).toBe("pending");
});

it("detects a repeated cursor without releasing unresolved widgets", async () => {
  const { recover, record } = setup();
  fetchNotifications.mockResolvedValue(page([], "same"));
  await expect(recover()).rejects.toThrow("cursor repeated");
  expect(fetchNotifications).toHaveBeenCalledTimes(2);
  expect(record().widgetRecovery).toBe("pending");
});

it("ignores completion history cached for another bridge network", async () => {
  const { client, recover, record } = setup();
  client.setQueryData(
    [
      "rwa-wallet-notifications",
      "wallet-a",
      "bridge-recovery",
      "other-network",
      undefined,
    ],
    page([completion()])
  );
  await recover();
  expect(fetchNotifications).toHaveBeenCalledOnce();
  expect(record().widgetRecovery).toBe("ready");
});

it("does not block received WSS success on unavailable recovery history", async () => {
  const { store, recover, record } = setup();
  fetchNotifications.mockRejectedValue(new Error("offline"));
  await expect(recover()).rejects.toThrow();
  store.observeEvent(signerEventSequence[4]);
  store.observeEvent(signerEventSequence[5]);
  expect(record().widgetRecovery).toBe("ready");
});

it("uses exact existing backend execution for recovery without changing fresh WSS presentation", async () => {
  const { store, recover, record, storage } = setup();
  store.reconcile([deposit({ log_index: 32, status: "executed" })]);
  await recover();
  expect(fetchNotifications).not.toHaveBeenCalled();
  expect(record().widgetRecovery).toBe("suppressed");
  const fresh = new BridgeTransactions("wallet-b", bridgeNetwork, storage);
  fresh.update({
    ...localRecord(),
    account: "wallet-b",
    isWidgetRequested: true,
  });
  fresh.observeEvent({ ...signerEventSequence[2], mavryk_address: "wallet-b" });
  fresh.reconcile([deposit({ log_index: 32, status: "executed" })]);
  expect(
    fresh.getSnapshot().transactions.get("operation-1")?.widgetRecovery
  ).toBeUndefined();
});

it("does not suppress a known log because another log in that transaction executed", () => {
  const { store, record } = setup();
  store.reconcile([deposit({ log_index: 99, status: "executed" })]);
  expect(record().widgetRecovery).toBe("pending");
});
