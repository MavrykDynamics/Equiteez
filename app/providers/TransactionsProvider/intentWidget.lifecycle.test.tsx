// @vitest-environment jsdom
import { QueryClient } from "@tanstack/react-query";
import { act, createElement, StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { IntentsApi } from "~/lib/apis/intents";
import {
  createIntentsMockApi,
  simulateMockDeposit,
  type IntentsMockScenario,
} from "~/lib/apis/intents/intents.mock";
import {
  newIdempotencyKey,
  newOperationCapability,
} from "~/lib/intents/intentCapability";
import { toIntentPreviewRequest } from "~/lib/intents/intentQuote";
import {
  fixtureRecipient,
  memoryStorage,
  record as fixtureRecord,
  request,
} from "~/lib/intents/intents.fixtures";
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
  account: "mv19MAVgCDwzuNMWprbHrUZhznoH8n9NWGWt" as string | null,
  scenario: null as IntentsMockScenario | null,
  api: null as unknown as IntentsApi,
  fetchDeposits: vi.fn(),
  success: vi.fn(),
}));
vi.mock("~/consts/intents", async (original) => ({
  ...(await original<typeof import("~/consts/intents")>()),
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

const accountA = fixtureRecipient;
const accountB = `mv1${"2".repeat(33)}`;

/** A funded operation persisted by an earlier page load. */
async function seedFundedOperation(account = accountA) {
  const credentials = {
    capability: newOperationCapability(),
    idempotencyKey: newIdempotencyKey(),
  };
  const input = toIntentPreviewRequest(request({ recipient: account }));
  const quote = await mocks.api.previewQuote(input);
  const body = { ...input, acceptedMinAmountOut: quote.bridgeableMinAmountOut };
  const { operation } = await mocks.api.createOperation(credentials, body);
  vi.setSystemTime(Date.now() + 1_500);
  await mocks.api.getOperation(credentials.capability, operation.id);
  const hash = `0x${"a".repeat(64)}` as const;
  simulateMockDeposit(mocks.api, credentials.capability, operation.id);
  const record = fixtureRecord({
    localId: `local-${account}`,
    account,
    env: "mock",
    ...credentials,
    request: body,
    operationId: operation.id,
    fundingState: "confirmed",
    sourceHashes: [hash],
    isWidgetRequested: true,
    sequence: 3,
  });
  localStorage.setItem(
    `equiteez:intents:v3:mock:${account}`,
    JSON.stringify({ version: 3, records: [record] })
  );
}
const storedRecord = (account = accountA) =>
  JSON.parse(localStorage.getItem(`equiteez:intents:v3:mock:${account}`)!)
    .records[0];

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
  mocks.account = accountA;
  mocks.scenario = null;
  mocks.success.mockReset();
  mocks.fetchDeposits.mockReset().mockResolvedValue([]);
  mocks.api = createIntentsMockApi({
    storage: () => memoryStorage(),
    latencyMs: 0,
    getScenario: () => mocks.scenario,
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
  it("recovers after reload, never presents WRAPPED as receipt, and announces settlement once", async () => {
    await seedFundedOperation();
    await render();
    await act(async () => vi.advanceTimersByTimeAsync(0));
    expect(cards()).toHaveLength(1);
    expect(element.textContent).toContain("Send Funds");

    await act(async () => vi.advanceTimersByTimeAsync(6_000));
    expect(intentModels()[0].state).toMatchObject({
      status: "progress",
      step: 2,
    });

    await act(async () => vi.advanceTimersByTimeAsync(20_000));
    expect(intentModels()[0].state).toMatchObject({
      status: "progress",
      step: 4,
      description: expect.stringMatching(/Waiting for Mavryk confirmation/),
    });
    expect(intentModels()[0].isTerminal).toBe(false);
    expect(mocks.success).not.toHaveBeenCalled();

    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    await act(async () => vi.advanceTimersByTimeAsync(15_000));
    expect(intentModels()[0].state).toEqual({
      status: "success",
      description: "24.921 wUSDT arrived in your Mavryk account.",
    });
    expect(mocks.success).toHaveBeenCalledOnce();
    expect(mocks.success).toHaveBeenCalledWith(
      "Deposit arrived",
      "24.921 wUSDT arrived in your Mavryk account."
    );
    expect(invalidate).toHaveBeenCalled();
    expect(storedRecord()).toMatchObject({ announced: true });

    // Reconnect/remount: no second announcement.
    await act(async () => root.unmount());
    root = createRoot(element);
    await render();
    await act(async () => vi.advanceTimersByTimeAsync(5_000));
    expect(mocks.success).toHaveBeenCalledOnce();
  });

  it("never shows another account's operation and does not duplicate on return", async () => {
    await seedFundedOperation(accountA);
    await render();
    await act(async () => vi.advanceTimersByTimeAsync(0));
    expect(intentModels()).toHaveLength(1);

    mocks.account = accountB;
    await render();
    await act(async () => vi.advanceTimersByTimeAsync(0));
    expect(intentModels()).toHaveLength(0);
    expect(cards()).toHaveLength(0);

    mocks.account = accountA;
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
      release = widgets.holdDeposit(`intent:local-${accountA}`);
    });
    await act(async () => vi.advanceTimersByTimeAsync(400)); // exit animation
    expect(widgets.visibleModels).toHaveLength(0);
    expect(cards()).toHaveLength(0);
    expect(intentModels()).toHaveLength(1); // tracking continues
    await act(async () => release());
    expect(cards()).toHaveLength(1);
  });

  it("lets an untracked settlement be dismissed for good", async () => {
    mocks.scenario = "untracked";
    await seedFundedOperation();
    await render();
    await act(async () => vi.advanceTimersByTimeAsync(90_000));
    const model = intentModels()[0];
    expect(model.state).toMatchObject({ status: "progress", step: 4 });
    expect(element.textContent).toContain("arrival is not confirmed yet");
    expect(model.isTerminal).toBe(true);
    await act(async () => widgets.dismiss(model.backendId!));
    await act(async () => vi.advanceTimersByTimeAsync(400)); // exit animation
    expect(cards()).toHaveLength(0);
    await render();
    expect(cards()).toHaveLength(0);
  });

  it("completes an untracked settlement from verified bridge data on the wrap identity", async () => {
    mocks.scenario = "untracked";
    await seedFundedOperation();
    await render();
    await act(async () => vi.advanceTimersByTimeAsync(90_000));
    const [event] = storedRecord().backend.forwarding.bridgeEvents;
    expect(event.transactionHash).not.toBe(storedRecord().sourceHashes[0]);
    mocks.fetchDeposits.mockResolvedValue([
      deposit({
        evm_tx_hash: event.transactionHash,
        log_index: event.logIndex,
        status: "executed",
      }),
    ]);
    await act(async () => transactions.refresh());
    await act(async () => vi.advanceTimersByTimeAsync(0));
    expect(intentModels()[0].state).toMatchObject({ status: "success" });
    expect(storedRecord()).toMatchObject({
      receipt: "correlated",
      announced: true,
    });
    expect(mocks.success).toHaveBeenCalledOnce();
    // The forwarded bridge deposit is not a second card or toast.
    expect(
      widgets.models.filter((model) => model.kind !== "intent")
    ).toHaveLength(0);
  });

  it("is not completed by an unrelated executed deposit", async () => {
    mocks.scenario = "untracked";
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
