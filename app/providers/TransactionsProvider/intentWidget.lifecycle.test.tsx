// @vitest-environment jsdom
import { QueryClient } from "@tanstack/react-query";
import { act, createElement, StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { IntentsApi } from "~/lib/apis/intents";
import {
  createIntentsMockApi,
  mockIntentRoutes,
} from "~/lib/apis/intents/intents.mock";
import { createIntentRecord } from "~/lib/intents/intentOperation";
import { memoryStorage } from "~/lib/intents/intents.fixtures";
import { NotifierConnectionStatus } from "../NotificationsProvider/notifications.const";
import { RTransactionWidgetHost } from "./components/RTransactionWidget/RTransactionWidgetHost";
import {
  TransactionsProvider,
  useTransactionsContext,
} from "./TransactionsProvider";
import { deposit } from "./bridgeTransactions.fixtures";
import {
  TransactionWidgetProvider,
  useTransactionWidget,
} from "./TransactionWidgetProvider";

const mocks = vi.hoisted(() => ({
  account: "wallet-a" as string | null,
  api: null as unknown as IntentsApi,
  fetchDeposits: vi.fn(),
  success: vi.fn(),
}));
vi.mock("~/consts/intents", async (original) => ({
  ...(await original<typeof import("~/consts/intents")>()),
  INTENTS_DEPOSIT_ENABLED: true,
  INTENTS_ENV: "mock",
}));
vi.mock("~/lib/apis/intents", async (original) => ({
  ...(await original<typeof import("~/lib/apis/intents")>()),
  getIntentsApi: () => mocks.api,
}));
vi.mock("~/providers/AuthProvider/auth.provider", () => ({
  useAuthContext: () => ({ isAuthenticated: Boolean(mocks.account) }),
}));
vi.mock("~/providers/UserProvider/user.provider", () => ({
  useUserContext: () => ({ userAddress: mocks.account }),
}));
vi.mock("~/providers/NotificationsProvider/NotificationsProvider", () => ({
  useNotificationsContext: () => ({
    status: NotifierConnectionStatus.Closed,
    wallet: mocks.account,
    registerChannelHandler: vi.fn(),
  }),
}));
vi.mock("~/providers/ToasterProvider/toaster.provider", () => ({
  useToasterContext: () => toaster,
}));
vi.mock("@tanstack/react-query", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-query")>()),
  useQueryClient: () => queryClient,
}));
vi.mock("~/lib/apis/rwa/bridge/bridge", () => ({
  fetchBridgeDeposits: (...args: unknown[]) => mocks.fetchDeposits(...args),
}));
vi.mock("~/lib/apis/rwa/notifications/notifications", () => ({
  fetchWalletNotifications: vi.fn(),
}));
vi.mock("~/lib/atoms/RIcon", () => ({ RIcon: () => null }));
vi.mock("~/lib/molecules/HashChip", () => ({
  HashChip: ({ hash }: { hash: string }) => createElement("span", null, hash),
}));
vi.mock("~/lib/atoms/Money", () => ({ default: () => null }));

let queryClient: QueryClient;
let root: Root;
let element: HTMLDivElement;
let widgets!: ReturnType<typeof useTransactionWidget>;
let transactions!: ReturnType<typeof useTransactionsContext>;
const toaster = { success: mocks.success, warning: vi.fn() };
function Probe() {
  widgets = useTransactionWidget();
  transactions = useTransactionsContext();
  return null;
}
const render = () =>
  act(async () =>
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
            createElement(RTransactionWidgetHost)
          )
        )
      )
    )
  );
const cards = () => [
  ...element.querySelectorAll('section[aria-label="Cross-chain deposit"]'),
];
const intentModels = () =>
  widgets.models.filter((model) => model.kind === "intent");

/** A funded operation persisted by an earlier page load. */
async function seedFundedOperation(account = "wallet-a") {
  const route = mockIntentRoutes[0];
  const operation = await mocks.api.createOperation({
    routeId: route.id,
    amountIn: "2000000000000000000",
    recipient: account,
    sourceAddress: "0x1111111111111111111111111111111111111111",
    idempotencyKey: `local-${account}`,
  });
  const hash = `0x${"a".repeat(64)}` as const;
  await mocks.api.submitDeposit(operation.id, hash);
  const record = {
    ...createIntentRecord({
      localId: `local-${account}`,
      account,
      env: "mock",
      route,
      amountIn: operation.amountIn,
      sourceAddress: operation.sourceAddress,
    }),
    operationId: operation.id,
    funding: operation.funding,
    fundingState: "confirmed" as const,
    sourceHashes: [hash],
    hintState: "sent" as const,
    isWidgetRequested: true,
    sequence: 3,
  };
  localStorage.setItem(
    `equiteez:intents:v1:mock:${account}`,
    JSON.stringify({ version: 1, records: [record] })
  );
}

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
  vi.setSystemTime(Date.parse("2026-11-13T10:00:00.000Z"));
  localStorage.clear();
  mocks.account = "wallet-a";
  mocks.success.mockReset();
  mocks.fetchDeposits.mockReset().mockResolvedValue([]);
  mocks.api = createIntentsMockApi({
    storage: () => memoryStorage(),
    latencyMs: 0,
    depositAddress: "0x2222222222222222222222222222222222222222",
    getScenario: () => null,
  });
  queryClient = new QueryClient();
  element = document.createElement("div");
  root = createRoot(element);
});
afterEach(async () => {
  await act(async () => root.unmount());
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("1Click operations in the global widget", () => {
  it("recovers after reload and follows the backend to neutral bridge processing", async () => {
    await seedFundedOperation();
    await render();
    await act(async () => vi.advanceTimersByTimeAsync(0));
    expect(cards()).toHaveLength(1);
    expect(element.textContent).toContain("Send Funds");

    await act(async () => vi.advanceTimersByTimeAsync(12_000));
    expect(intentModels()[0].state).toMatchObject({
      status: "progress",
      step: 2,
    });

    await act(async () => vi.advanceTimersByTimeAsync(60_000));
    expect(intentModels()[0].state).toMatchObject({
      status: "progress",
      step: 4,
    });
    expect(element.textContent).toContain("arrival is not confirmed yet");
    expect(element.textContent).not.toContain("Successfully transferred");
    expect(cards()).toHaveLength(1);
    expect(
      cards()[0].querySelector('button[aria-label="Dismiss transaction"]')
    ).not.toBeNull();
  });

  it("never shows another account's operation and does not duplicate on return", async () => {
    await seedFundedOperation("wallet-a");
    await render();
    await act(async () => vi.advanceTimersByTimeAsync(0));
    expect(intentModels()).toHaveLength(1);

    mocks.account = "wallet-b";
    await render();
    await act(async () => vi.advanceTimersByTimeAsync(0));
    expect(intentModels()).toHaveLength(0);
    expect(cards()).toHaveLength(0);

    mocks.account = "wallet-a";
    await render();
    await act(async () => vi.advanceTimersByTimeAsync(0));
    expect(intentModels()).toHaveLength(1);
    expect(cards()).toHaveLength(1);
  });

  it("hides the card while the modal holds it and shows it on minimize", async () => {
    await seedFundedOperation();
    await render();
    await act(async () => vi.advanceTimersByTimeAsync(0));
    let release!: () => void;
    await act(async () => {
      release = widgets.holdDeposit("intent:local-wallet-a");
    });
    await act(async () => vi.advanceTimersByTimeAsync(400)); // exit animation
    expect(widgets.visibleModels).toHaveLength(0);
    expect(cards()).toHaveLength(0);
    expect(intentModels()).toHaveLength(1); // tracking continues
    await act(async () => release());
    expect(cards()).toHaveLength(1);
  });

  it("dismisses a finished card for good", async () => {
    await seedFundedOperation();
    await render();
    await act(async () => vi.advanceTimersByTimeAsync(90_000));
    const model = intentModels()[0];
    expect(model.isTerminal).toBe(true);
    await act(async () => widgets.dismiss(model.backendId!));
    await act(async () => vi.advanceTimersByTimeAsync(400)); // exit animation
    expect(cards()).toHaveLength(0);
    await render();
    expect(cards()).toHaveLength(0);
  });

  const storedRecord = () =>
    JSON.parse(localStorage.getItem("equiteez:intents:v1:mock:wallet-a")!)
      .records[0];

  it("completes and announces once from verified settlement of the forward identity", async () => {
    await seedFundedOperation();
    await render();
    await act(async () => vi.advanceTimersByTimeAsync(90_000));
    const { forwardTxHash, forwardLogIndex } = storedRecord().backend;
    expect(forwardTxHash).not.toBe(storedRecord().sourceHashes[0]);
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    mocks.fetchDeposits.mockResolvedValue([
      deposit({
        evm_tx_hash: forwardTxHash,
        log_index: forwardLogIndex,
        status: "executed",
      }),
    ]);
    await act(async () => transactions.refresh());
    await act(async () => vi.advanceTimersByTimeAsync(0));
    expect(intentModels()[0].state).toEqual({ status: "success" });
    expect(storedRecord()).toMatchObject({
      receipt: "correlated",
      announced: true,
    });
    expect(mocks.success).toHaveBeenCalledOnce();
    expect(mocks.success).toHaveBeenCalledWith(
      "Deposit arrived",
      expect.any(String)
    );
    expect(invalidate).toHaveBeenCalled();
    // The forwarded bridge deposit is not a second card.
    expect(
      widgets.models.filter((model) => model.kind !== "intent")
    ).toHaveLength(0);

    // Reconnect/remount: no second announcement.
    await act(async () => root.unmount());
    root = createRoot(element);
    await render();
    await act(async () => transactions.refresh());
    await act(async () => vi.advanceTimersByTimeAsync(0));
    expect(mocks.success).toHaveBeenCalledOnce();
  });

  it("is not completed by an unrelated executed deposit", async () => {
    await seedFundedOperation();
    await render();
    await act(async () => vi.advanceTimersByTimeAsync(90_000));
    mocks.fetchDeposits.mockResolvedValue([
      deposit({ evm_tx_hash: `0x${"e".repeat(64)}`, status: "executed" }),
    ]);
    await act(async () => transactions.refresh());
    await act(async () => vi.advanceTimersByTimeAsync(0));
    expect(intentModels()[0].state).toMatchObject({
      status: "progress",
      step: 4,
    });
    expect(mocks.success).not.toHaveBeenCalled();
  });
});
