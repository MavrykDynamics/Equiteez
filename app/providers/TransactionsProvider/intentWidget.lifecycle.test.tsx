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
import { TransactionsProvider } from "./TransactionsProvider";
import {
  TransactionWidgetProvider,
  useTransactionWidget,
} from "./TransactionWidgetProvider";

const mocks = vi.hoisted(() => ({
  account: "wallet-a" as string | null,
  api: null as unknown as IntentsApi,
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
  useToasterContext: () => ({ success: vi.fn(), warning: vi.fn() }),
}));
vi.mock("@tanstack/react-query", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-query")>()),
  useQueryClient: () => queryClient,
}));
vi.mock("~/lib/apis/rwa/bridge/bridge", () => ({
  fetchBridgeDeposits: vi.fn().mockResolvedValue({ deposits: [] }),
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
function Probe() {
  widgets = useTransactionWidget();
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
});
