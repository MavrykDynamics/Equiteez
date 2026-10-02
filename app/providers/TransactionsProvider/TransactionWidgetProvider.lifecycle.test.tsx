// @vitest-environment jsdom
import { act, createElement, StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  TransactionsProvider,
  useTransactionsContext,
} from "./TransactionsProvider";
import {
  TransactionWidgetProvider,
  useTransactionWidget,
} from "./TransactionWidgetProvider";
import { RTransactionWidgetHost } from "./components/RTransactionWidget/RTransactionWidgetHost";
import {
  deposit,
  localRecord,
  signerEventSequence,
} from "./bridgeTransactions.fixtures";
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
let widgets!: ReturnType<typeof useTransactionWidget>;
function Probe() {
  transactions = useTransactionsContext();
  widgets = useTransactionWidget();
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
const event = async (
  id: string,
  wallet = "wallet-a",
  payload: Record<string, unknown> = {
    status: "COMPLETED",
    recipient: "untrusted",
  }
) => {
  await act(async () => {
    for (const handler of handlers)
      handler(
        {
          type: NotifierServerFrameType.Event,
          channel: "wallet",
          event_id: id,
          event_type: NotifierWalletEvent.BridgeDepositUpdated,
          occurred_at: "2026-09-24T00:00:00Z",
          payload,
        },
        wallet
      );
  });
};
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.useFakeTimers({
    toFake: [
      "Date",
      "setTimeout",
      "clearTimeout",
      "setInterval",
      "clearInterval",
    ],
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

it("replays events.md into one stable widget, ignoring duplicates and API errors", async () => {
  mocks.fetch.mockRejectedValue(new Error("API unavailable"));
  await render();
  const registrations = mocks.register.mock.calls.length;
  const requests = mocks.fetch.mock.calls.length;
  let card: Element | null = null;
  let firstStep: Element | null = null;
  for (const [index, payload] of signerEventSequence.entries()) {
    await event(`signer-${index}`, "wallet-a", payload);
    const cards = element.querySelectorAll('[aria-label="Bridge transaction"]');
    expect(cards).toHaveLength(1);
    card ??= cards[0];
    expect(cards[0]).toBe(card);
    expect(card.textContent).toContain("1.5 USDT");
    if (index < 5) {
      firstStep ??= card.querySelector("li");
      expect(card.querySelector("li")).toBe(firstStep);
      expect(card.getAttribute("data-status")).toBe("progress");
      expect(
        [...card.querySelectorAll("li")].findIndex(
          (step) => step.getAttribute("aria-current") === "step"
        )
      ).toBe(Math.min(index, 3));
    } else {
      expect(card.getAttribute("data-status")).toBe("success");
      expect(card.textContent).toContain("Successfully transferred");
    }
    const snapshot = transactions.transactions;
    await event(`copy-${index}`, "wallet-a", {
      ...payload,
      updated_at: "2026-09-26T00:00:00Z",
    });
    expect(transactions.transactions).toBe(snapshot);
    expect(transactions.transactions.size).toBe(1);
  }
  await event("out-of-order", "wallet-a", signerEventSequence[0]);
  expect(card?.getAttribute("data-status")).toBe("success");
  expect(mocks.fetch).toHaveBeenCalledTimes(requests);
  // Adopting an early event into the local operation keeps the existing DOM card.
  await act(async () => transactions.publish(localRecord()));
  expect(transactions.transactions.size).toBe(1);
  expect(element.querySelector('[aria-label="Bridge transaction"]')).toBe(card);
  expect(mocks.register).toHaveBeenCalledTimes(registrations);
  expect(mocks.success).not.toHaveBeenCalled();
  expect(mocks.invalidateQueries).not.toHaveBeenCalled();
  for (const copy of [
    "Refresh status",
    "Show deposits",
    "Hide deposits",
    "Dismiss",
    "Cancel",
    "unverified",
    "unavailable",
  ])
    expect(element.textContent).not.toContain(copy);
  expect(element.querySelector('[role="tablist"]')).toBeNull();
});

it("retains concurrent event cards through route/loading remounts", async () => {
  await render();
  const registrations = mocks.register.mock.calls.length;
  await event("first", "wallet-a", signerEventSequence[0]);
  await event("other-log", "wallet-a", {
    ...signerEventSequence[0],
    initial_log_index: 33,
  });
  expect(
    element.querySelectorAll('[aria-label="Bridge transaction"]')
  ).toHaveLength(2);
  await render(false);
  await event("next", "wallet-a", signerEventSequence[1]);
  await render();
  expect(
    element.querySelectorAll('[aria-label="Bridge transaction"]')
  ).toHaveLength(2);
  expect(transactions.transactions.size).toBe(2);
  expect(handlers.size).toBe(1);
  expect(mocks.register).toHaveBeenCalledTimes(registrations);
});

it("shows no local-only or API-only cards and resets live evidence on logout/login", async () => {
  mocks.fetch.mockResolvedValue([
    deposit({ log_index: 32, status: "executed" }),
  ]);
  await render();
  await act(async () => transactions.publish(localRecord()));
  expect(element.textContent).toBe("");
  await event("live", "wallet-a", signerEventSequence[0]);
  // API execution cannot skip the agreed WSS sequence.
  expect(element.querySelector('[data-status="progress"]')).not.toBeNull();
  mocks.account = null;
  await render();
  expect(handlers.size).toBe(0);
  expect(element.textContent).toBe("");
  mocks.account = "wallet-a";
  await render();
  expect(handlers.size).toBe(1);
  expect(element.textContent).toBe("");
});

it("rejects late old-account responses, publications and events", async () => {
  await render();
  const oldPublish = transactions.publish;
  let resolve!: (rows: BridgeDeposit[]) => void;
  mocks.fetch.mockImplementationOnce(
    () =>
      new Promise<BridgeDeposit[]>((done) => {
        resolve = done;
      })
  );
  await act(async () => transactions.refresh());
  const signal = mocks.fetch.mock.lastCall![1] as AbortSignal;
  mocks.account = "wallet-b";
  mocks.fetch.mockResolvedValue([]);
  await render();
  expect(signal.aborted).toBe(true);
  await act(async () => {
    resolve([deposit({ status: "executed" })]);
    oldPublish(localRecord());
  });
  await event("old-wallet", "wallet-a", signerEventSequence[0]);
  expect(transactions.transactions.size).toBe(0);
  expect(element.textContent).toBe("");
  expect(mocks.success).not.toHaveBeenCalled();
});

it("retains event progress through hidden/foreground API recovery and storage errors", async () => {
  const visibility = vi
    .spyOn(document, "visibilityState", "get")
    .mockReturnValue("visible");
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new Error("Storage blocked");
  });
  await render();
  await event("first", "wallet-a", signerEventSequence[0]);
  expect(transactions.storageError).toBeTruthy();
  expect(element.textContent).not.toContain("could not be read");
  visibility.mockReturnValue("hidden");
  await act(async () => document.dispatchEvent(new Event("visibilitychange")));
  await vi.advanceTimersByTimeAsync(0);
  expect(vi.getTimerCount()).toBe(0);
  await event("second", "wallet-a", signerEventSequence[1]);
  visibility.mockReturnValue("visible");
  mocks.fetch.mockRejectedValue(new Error("Unavailable"));
  await act(async () => document.dispatchEvent(new Event("visibilitychange")));
  expect(element.querySelector('[data-status="progress"]')).not.toBeNull();
  expect(element.querySelector('[data-status="warning"]')).toBeNull();
  expect(element.querySelector('[aria-current="step"]')?.textContent).toContain(
    "Validators Sign"
  );
});

it("ignores malformed and wrong-recipient event data without creating cards", async () => {
  await render();
  for (const [index, payload] of [
    { ...signerEventSequence[0], direction: "out" },
    { ...signerEventSequence[0], mavryk_address: "wallet-b" },
    { ...signerEventSequence[0], initial_tx_hash: "invalid" },
    { ...signerEventSequence[0], amount: "invalid" },
    { ...signerEventSequence[0], status: "UNKNOWN" },
  ].entries())
    await event(`invalid-${index}`, "wallet-a", payload);
  expect(transactions.transactions.size).toBe(0);
  expect(element.textContent).toBe("");
});

it("expires only the successful log after five seconds without resetting its deadline on replay", async () => {
  await render();
  await event("first", "wallet-a", signerEventSequence[0]);
  await event("concurrent", "wallet-a", {
    ...signerEventSequence[0],
    initial_log_index: 33,
  });
  const cards = () =>
    element.querySelectorAll('[aria-label="Bridge transaction"]');
  const activeCard = cards()[1];
  expect(
    element.querySelector('[aria-label="Dismiss transaction"]')
  ).toBeNull();
  for (const [index, payload] of signerEventSequence.slice(1).entries())
    await event(`complete-${index}`, "wallet-a", payload);
  expect(cards()[0].getAttribute("data-status")).toBe("success");
  expect(cards()[1]).toBe(activeCard);
  expect(
    element.querySelectorAll('[aria-label="Dismiss transaction"]')
  ).toHaveLength(0);
  await act(async () => vi.advanceTimersByTimeAsync(4_999));
  await event("duplicate", "wallet-a", signerEventSequence[5]);
  expect(cards()).toHaveLength(2);
  await act(async () => vi.advanceTimersByTimeAsync(1));
  await act(async () => vi.advanceTimersByTimeAsync(360));
  expect(cards()).toHaveLength(1);
  expect(cards()[0]).toBe(activeCard);
  expect(transactions.transactions.size).toBe(2);
  await event("replay", "wallet-a", signerEventSequence[5]);
  expect(cards()).toHaveLength(1);
});

it("manual terminal dismissal survives logout/login and keeps concurrent tracking intact", async () => {
  await render();
  for (const [index, payload] of signerEventSequence.entries())
    await event(`complete-${index}`, "wallet-a", payload);
  await event("concurrent", "wallet-a", {
    ...signerEventSequence[0],
    initial_log_index: 33,
  });
  await act(async () => {
    const model = widgets.visibleModels.find(
      (item) => item.state.status === "success"
    )!;
    widgets.dismiss(model.backendId ?? model.operationId);
  });
  await act(async () => vi.advanceTimersByTimeAsync(360));
  expect(
    element.querySelectorAll('[aria-label="Bridge transaction"]')
  ).toHaveLength(1);
  expect(transactions.transactions.size).toBe(2);
  mocks.account = null;
  await render();
  mocks.account = "wallet-a";
  await render();
  await event("terminal-replay", "wallet-a", signerEventSequence[5]);
  expect(element.querySelector('[aria-label="Bridge transaction"]')).toBeNull();
  await event("active-replay", "wallet-a", {
    ...signerEventSequence[1],
    initial_log_index: 33,
  });
  expect(element.querySelector('[data-status="progress"]')).not.toBeNull();
});

it("follows growing content at the bottom but preserves a user scrolled-up position", async () => {
  let resize = () => {};
  const disconnect = vi.fn();
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback: () => void) {
        resize = callback;
      }
      observe() {}
      disconnect = disconnect;
    }
  );
  await render();
  await event("first", "wallet-a", signerEventSequence[0]);
  const panel = element.querySelector(
    '[aria-label="Bridge deposits"]'
  ) as HTMLElement;
  let height = 600;
  Object.defineProperties(panel, {
    scrollHeight: { get: () => height },
    clientHeight: { get: () => 300 },
    scrollTop: { value: 300, writable: true },
  });
  await act(async () =>
    panel.dispatchEvent(new Event("scroll", { bubbles: true }))
  );
  height = 750;
  resize();
  // The browser clamps this assignment to scrollHeight - clientHeight.
  expect(panel.scrollTop).toBe(750);
  panel.scrollTop = 50;
  await act(async () =>
    panel.dispatchEvent(new Event("scroll", { bubbles: true }))
  );
  await event("second", "wallet-a", {
    ...signerEventSequence[0],
    initial_log_index: 33,
  });
  height = 900;
  resize();
  expect(panel.scrollTop).toBe(50);
  await render(false);
  expect(disconnect).toHaveBeenCalled();
});

it("holds only the popup deposit and releases an immediate waiting card before WSS", async () => {
  await render();
  let release!: () => void;
  await act(async () => {
    release = widgets.holdDeposit("operation-1");
    transactions.publish({ ...localRecord(), isWidgetRequested: true });
  });
  expect(widgets.models[0].state.status).toBe("waiting");
  expect(widgets.visibleModels).toHaveLength(0);
  await event("unrelated", "wallet-a", {
    ...signerEventSequence[0],
    initial_tx_hash: `0x${"c".repeat(64)}`,
  });
  expect(widgets.visibleModels).toHaveLength(1);
  expect(widgets.visibleModels[0].operationId).not.toBe("operation-1");
  await act(async () => release());
  expect(widgets.visibleModels).toHaveLength(2);
  const waitingCard = element.querySelector('[data-status="waiting"]');
  expect(waitingCard).not.toBeNull();
  await event("first", "wallet-a", signerEventSequence[0]);
  expect(waitingCard?.getAttribute("data-status")).toBe("progress");
  expect(
    widgets.models.find((model) => model.operationId === "operation-1")?.state
  ).toEqual({ status: "progress", step: 1 });
  expect(element.querySelector('[data-status="waiting"]')).toBeNull();
});

it("tracks hidden progress and starts only its success deadline on release", async () => {
  await render();
  let release!: () => void;
  await act(async () => {
    release = widgets.holdDeposit("operation-1");
    transactions.publish({ ...localRecord(), isWidgetRequested: true });
  });
  for (const [index, payload] of signerEventSequence.entries()) {
    await event(`held-${index}`, "wallet-a", payload);
    await event(`other-${index}`, "wallet-a", {
      ...payload,
      initial_tx_hash: `0x${"c".repeat(64)}`,
    });
    expect(widgets.visibleModels).toHaveLength(1);
  }
  expect(
    widgets.models.find((model) => model.operationId === "operation-1")?.state
      .status
  ).toBe("success");
  await act(async () => vi.advanceTimersByTimeAsync(10_000));
  expect(widgets.visibleModels).toHaveLength(0);
  await act(async () => release());
  expect(widgets.visibleModels).toHaveLength(1);
  expect(widgets.visibleModels[0].state.status).toBe("success");
  await act(async () => vi.advanceTimersByTimeAsync(4_999));
  expect(widgets.visibleModels).toHaveLength(1);
  await event("duplicate", "wallet-a", signerEventSequence[5]);
  await act(async () => vi.advanceTimersByTimeAsync(361));
  expect(widgets.visibleModels).toHaveLength(0);
});

it.each([0, 3, 6])(
  "releases popup recovery after reload with %s received transitions",
  async (count) => {
    await render();
    await act(async () => {
      widgets.holdDeposit("operation-1");
      transactions.publish({ ...localRecord(), isWidgetRequested: true });
    });
    for (const [index, payload] of signerEventSequence
      .slice(0, count)
      .entries())
      await event(`held-${index}`, "wallet-a", payload);
    expect(widgets.visibleModels).toHaveLength(0);
    await act(async () => root.unmount());
    root = createRoot(element);
    await render();
    expect(widgets.visibleModels).toHaveLength(1);
    expect(widgets.visibleModels[0].state).toMatchObject(
      count === 0
        ? { status: "waiting" }
        : count === 6
          ? { status: "success" }
          : { status: "progress", step: 3 }
    );
    if (count === 6) {
      await act(async () => vi.advanceTimersByTimeAsync(5_360));
      expect(widgets.visibleModels).toHaveLength(0);
      await act(async () => root.unmount());
      root = createRoot(element);
      await render();
      expect(widgets.visibleModels).toHaveLength(0);
    }
  }
);
