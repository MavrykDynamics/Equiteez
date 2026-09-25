// @vitest-environment jsdom
import { act, createElement, StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  TransactionsProvider,
  useTransactionsContext,
} from "./TransactionsProvider";
import { TransactionWidgetProvider } from "./TransactionWidgetProvider";
import { RTransactionWidgetHost } from "./components/RTransactionWidget/RTransactionWidgetHost";
import { deposit, localRecord } from "./bridgeTransactions.fixtures";
import {
  NotifierConnectionStatus,
  NotifierServerFrameType,
  NotifierWalletEvent,
} from "../NotificationsProvider/notifications.const";
import type { NotifierChannelHandler } from "../NotificationsProvider/notifications.provider.types";
import type { BridgeDeposit } from "~/lib/apis/rwa/bridge/bridge.schema";

const mocks = vi.hoisted(() => ({
  account: "wallet-a" as string | null,
  connected: true,
  fetch: vi.fn(),
  register: vi.fn(),
  success: vi.fn(),
  warning: vi.fn(),
  invalidateQueries: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("~/providers/AuthProvider/auth.provider", () => ({
  useAuthContext: () => ({ isAuthenticated: Boolean(mocks.account) }),
}));
vi.mock("~/providers/UserProvider/user.provider", () => ({
  useUserContext: () => ({ userAddress: mocks.account }),
}));
vi.mock("~/providers/NotificationsProvider/NotificationsProvider", () => ({
  useNotificationsContext: () => ({
    status: mocks.connected
      ? NotifierConnectionStatus.Connected
      : NotifierConnectionStatus.Closed,
    wallet: mocks.account,
    registerChannelHandler: mocks.register,
  }),
}));
vi.mock("~/providers/ToasterProvider/toaster.provider", () => ({
  useToasterContext: () => ({ success: mocks.success, warning: mocks.warning }),
}));
vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: mocks.invalidateQueries }),
}));
vi.mock("~/lib/apis/rwa/bridge/bridge", () => ({
  fetchBridgeDeposits: (...args: unknown[]) => mocks.fetch(...args),
}));
vi.mock("~/lib/atoms/RIcon", () => ({ RIcon: () => null }));
vi.mock("~/lib/molecules/HashChip", () => ({
  HashChip: ({ hash }: { hash: string }) => createElement("button", null, hash),
}));
vi.mock("~/lib/atoms/Money", () => ({ default: () => null }));

let root: Root;
let element: HTMLDivElement;
let handlers: Set<NotifierChannelHandler>;
let transactions!: ReturnType<typeof useTransactionsContext>;
function Probe() {
  transactions = useTransactionsContext();
  return null;
}
const render = async (showHost = true) => {
  await act(async () => {
    root.render(
      createElement(
        StrictMode,
        null,
        createElement(
          TransactionsProvider,
          null,
          createElement(
            TransactionWidgetProvider,
            null,
            createElement(Probe),
            showHost ? createElement(RTransactionWidgetHost) : null
          )
        )
      )
    );
  });
};
const event = async (id: string, wallet = "wallet-a") => {
  await act(async () => {
    for (const handler of handlers)
      handler(
        {
          type: NotifierServerFrameType.Event,
          channel: "wallet",
          event_id: id,
          event_type: NotifierWalletEvent.BridgeDepositUpdated,
          occurred_at: "2026-09-24T00:00:00Z",
          payload: { status: "COMPLETED", recipient: "untrusted" },
        },
        wallet
      );
  });
};
const click = async (label: string) => {
  const button = [...element.querySelectorAll("button")].find((item) =>
    item.textContent?.startsWith(label)
  );
  expect(button).toBeDefined();
  await act(async () =>
    button!.dispatchEvent(new MouseEvent("click", { bubbles: true }))
  );
};
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.useFakeTimers({
    toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
  });
  vi.clearAllMocks();
  localStorage.clear();
  mocks.account = "wallet-a";
  mocks.connected = true;
  mocks.fetch.mockReset().mockResolvedValue([]);
  handlers = new Set();
  mocks.register.mockImplementation(
    (_channel: string, handler: NotifierChannelHandler) => {
      handlers.add(handler);
      return () => handlers.delete(handler);
    }
  );
  element = document.createElement("div");
  document.body.appendChild(element);
  root = createRoot(element);
});
afterEach(async () => {
  await act(async () => root.unmount());
  expect(handlers.size).toBe(0);
  await vi.advanceTimersByTimeAsync(0);
  const remainingTimers = vi.getTimerCount();
  element.remove();
  vi.restoreAllMocks();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  expect(remainingTimers).toBe(0);
});

it("keeps one listener across Strict Mode, external cards, updates, dismissal and route/loading remount", async () => {
  await render();
  expect(handlers.size).toBe(1);
  const registrations = mocks.register.mock.calls.length;
  mocks.fetch.mockResolvedValue([
    deposit({ status: "signing" }),
    deposit({ log_index: 2 }),
  ]);
  await event("first");
  expect(
    element.querySelectorAll('[aria-label="Bridge transaction"]')
  ).toHaveLength(2);
  // The frame says COMPLETED, but the authoritative rows are still in flight.
  expect(element.textContent).not.toContain("Successfully transferred");
  expect(mocks.success).not.toHaveBeenCalled();
  expect(mocks.invalidateQueries).not.toHaveBeenCalled();
  const firstCard = element.querySelector('[aria-label="Bridge transaction"]');
  await event("distinct-event-same-deposit");
  expect(element.querySelector('[aria-label="Bridge transaction"]')).toBe(
    firstCard
  );
  await click("Dismiss");
  expect(
    element.querySelectorAll('[aria-label="Bridge transaction"]')
  ).toHaveLength(1);
  await render(false);
  await render();
  expect(
    element.querySelectorAll('[aria-label="Bridge transaction"]')
  ).toHaveLength(1);
  mocks.fetch.mockResolvedValue([
    deposit({ status: "executed" }),
    deposit({ log_index: 2, status: "executed" }),
  ]);
  await event("completed");
  expect(element.textContent).toContain("Successfully transferred");
  expect(
    element.querySelectorAll('[aria-label="Bridge transaction"]')
  ).toHaveLength(1);
  expect(mocks.success).toHaveBeenCalledTimes(2);
  expect(mocks.invalidateQueries).toHaveBeenCalledOnce();
  await event("completed-again");
  expect(mocks.success).toHaveBeenCalledTimes(2);
  await click("Show deposits");
  expect(
    element.querySelectorAll('[aria-label="Bridge transaction"]')
  ).toHaveLength(2);
  expect(mocks.register).toHaveBeenCalledTimes(registrations);
  const requests = mocks.fetch.mock.calls.length;
  await click("Refresh status");
  expect(mocks.fetch).toHaveBeenCalledTimes(requests + 1);
});
it("suppresses historical execution and resets dismissal on logout/login to the same wallet", async () => {
  mocks.fetch.mockResolvedValue([deposit({ status: "executed" })]);
  await render();
  expect(
    element.querySelectorAll('[aria-label="Bridge transaction"]')
  ).toHaveLength(0);
  expect(mocks.success).not.toHaveBeenCalled();
  await click("Show deposits");
  expect(element.textContent).toContain("Successfully transferred");
  await click("Dismiss");
  mocks.account = null;
  await render();
  expect(handlers.size).toBe(0);
  expect(element.textContent).toBe("");
  mocks.account = "wallet-a";
  await render();
  expect(handlers.size).toBe(1);
  await click("Show deposits");
  expect(
    element.querySelectorAll('[aria-label="Bridge transaction"]')
  ).toHaveLength(1);
});
it("rejects late old-account responses and old local publications", async () => {
  await render();
  const oldPublish = transactions.publish;
  let resolve!: (rows: BridgeDeposit[]) => void;
  mocks.fetch.mockImplementationOnce(
    () =>
      new Promise<BridgeDeposit[]>((done) => {
        resolve = done;
      })
  );
  await event("pending");
  const signal = mocks.fetch.mock.lastCall![1] as AbortSignal;
  mocks.account = "wallet-b";
  mocks.fetch.mockResolvedValue([]);
  await render();
  expect(signal.aborted).toBe(true);
  await act(async () => {
    resolve([deposit({ status: "executed" })]);
    oldPublish(localRecord());
  });
  expect(transactions.transactions.size).toBe(0);
  expect(mocks.success).not.toHaveBeenCalled();
  const count = mocks.fetch.mock.calls.length;
  await event("old-wallet", "wallet-a");
  expect(mocks.fetch).toHaveBeenCalledTimes(count);
});
it("stops hidden polling, recovers in foreground and retains storage uncertainty", async () => {
  const visibility = vi
    .spyOn(document, "visibilityState", "get")
    .mockReturnValue("visible");
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new Error("Storage blocked");
  });
  mocks.fetch.mockResolvedValue([deposit()]);
  await render();
  expect(element.textContent).toContain("could not be read");
  visibility.mockReturnValue("hidden");
  await act(async () => document.dispatchEvent(new Event("visibilitychange")));
  await vi.advanceTimersByTimeAsync(0);
  expect(vi.getTimerCount()).toBe(0);
  const count = mocks.fetch.mock.calls.length;
  await event("hidden");
  expect(mocks.fetch).toHaveBeenCalledTimes(count);
  visibility.mockReturnValue("visible");
  mocks.fetch.mockResolvedValue([deposit({ status: "executed" })]);
  await act(async () => document.dispatchEvent(new Event("visibilitychange")));
  expect(element.textContent).toContain("Successfully transferred");
});

it("tracks local deposits without deployment binding and shows only API-backed cards", async () => {
  vi.stubEnv("RWA_BRIDGE_DEPLOYMENT", "");
  try {
    await render();
    expect(mocks.fetch).toHaveBeenCalled();
    expect(element.textContent).toBe("");
    await act(async () => transactions.publish(localRecord()));
    expect(transactions.transactions.size).toBe(1);
    expect(element.textContent).toBe("");

    mocks.fetch.mockRejectedValueOnce(new Error("Status unavailable"));
    await event("unavailable");
    expect(transactions.reconciliationError).toContain("unavailable");
    expect(element.textContent).toBe("");

    mocks.fetch.mockResolvedValue([deposit({ status: "executed" })]);
    await event("arrived");
    expect(transactions.transactions.size).toBe(1);
    expect(transactions.transactions.get("operation-1")?.settlement).toBe("executed");
    expect(element.textContent).toContain("Successfully transferred");
    expect(element.textContent).not.toContain("unverified");
    expect(mocks.success).toHaveBeenCalledOnce();
    await event("duplicate-arrival");
    expect(mocks.success).toHaveBeenCalledOnce();
  } finally {
    vi.unstubAllEnvs();
  }
});
