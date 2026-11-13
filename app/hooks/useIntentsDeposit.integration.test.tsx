// @vitest-environment jsdom
/**
 * EQ-FE-06: one 1Click deposit from quote to verified receipt, inside
 * Equiteez, against the mock backend and real tracking providers. Wallet
 * calls are mocked at the wagmi action boundary.
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BigNumber } from "bignumber.js";
import { act, createElement, StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arbitrumSepolia, sepolia } from "wagmi/chains";

import type { IntentsApi } from "~/lib/apis/intents";
import { createIntentsMockApi } from "~/lib/apis/intents/intents.mock";
import { memoryStorage } from "~/lib/intents/intents.fixtures";
import type { EthereumContext } from "~/providers/EthereumProvider/ethereum.provider.types";
import { NotifierConnectionStatus } from "~/providers/NotificationsProvider/notifications.const";
import { deposit } from "~/providers/TransactionsProvider/bridgeTransactions.fixtures";
import {
  TransactionsProvider,
  useTransactionsContext,
} from "~/providers/TransactionsProvider/TransactionsProvider";
import {
  TransactionWidgetProvider,
  useTransactionWidget,
} from "~/providers/TransactionsProvider/TransactionWidgetProvider";
import { useIntentsDeposit } from "./useIntentsDeposit";

const account = "mv19MAVgCDwzuNMWprbHrUZhznoH8n9NWGWt";
const source = "0x1111111111111111111111111111111111111111" as const;
const fundingHash = `0x${"b".repeat(64)}` as const;

const mocks = vi.hoisted(() => ({
  account: "mv19MAVgCDwzuNMWprbHrUZhznoH8n9NWGWt" as string | null,
  api: null as unknown as IntentsApi,
  fetchDeposits: vi.fn(),
  success: vi.fn(),
  actions: {
    getAccount: vi.fn(),
    getBalance: vi.fn(),
    readContract: vi.fn(),
    sendTransaction: vi.fn(),
    switchChain: vi.fn(),
    waitForTransactionReceipt: vi.fn(),
    writeContract: vi.fn(),
  },
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
vi.mock("wagmi", () => ({
  useConfig: () => ({ chains: [arbitrumSepolia, sepolia] }),
  useSwitchChain: () => ({ switchChainAsync: vi.fn(), isPending: false }),
}));
vi.mock("wagmi/actions", () => mocks.actions);
vi.mock("~/providers/EthereumProvider/hooks/useIntentSourceBalance", () => ({
  useIntentSourceBalance: () => ({
    balance: new BigNumber(100),
    status: "ready",
    refetch: vi.fn(),
  }),
}));
vi.mock("~/providers/TokensProvider/tokens.provider", () => ({
  useTokensContext: () => ({ tokensMetadata: {} }),
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
const toaster = { success: mocks.success, warning: vi.fn() };
vi.mock("~/providers/ToasterProvider/toaster.provider", () => ({
  useToasterContext: () => toaster,
}));
vi.mock("~/lib/apis/rwa/bridge/bridge", () => ({
  fetchBridgeDeposits: (...args: unknown[]) => mocks.fetchDeposits(...args),
}));
vi.mock("~/lib/apis/rwa/notifications/notifications", () => ({
  fetchWalletNotifications: vi.fn(),
}));

let root: Root;
let queryClient: QueryClient;
let deposit$!: ReturnType<typeof useIntentsDeposit>;
let widgets!: ReturnType<typeof useTransactionWidget>;
let transactions!: ReturnType<typeof useTransactionsContext>;
const wallet = {
  userAddress: source,
  isConnected: true,
  chainId: arbitrumSepolia.id,
} as unknown as EthereumContext;

function Modal() {
  deposit$ = useIntentsDeposit({
    recipient: mocks.account,
    ethereumWallet: wallet,
  });
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
          QueryClientProvider,
          { client: queryClient },
          createElement(
            TransactionsProvider,
            null,
            createElement(TransactionWidgetProvider, null, createElement(Modal))
          )
        )
      )
    )
  );
const flush = (ms = 0) => act(async () => vi.advanceTimersByTimeAsync(ms));
const intentCards = () =>
  widgets.visibleModels.filter((model) => model.kind === "intent");

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
  mocks.account = account;
  mocks.success.mockReset();
  mocks.fetchDeposits.mockReset().mockResolvedValue([]);
  for (const action of Object.values(mocks.actions)) action.mockReset();
  mocks.actions.getAccount.mockReturnValue({
    isConnected: true,
    address: source,
    chainId: arbitrumSepolia.id,
  });
  mocks.actions.readContract.mockResolvedValue(10n ** 21n);
  mocks.actions.writeContract.mockResolvedValue(fundingHash);
  mocks.actions.waitForTransactionReceipt.mockResolvedValue({
    status: "success",
    transactionHash: fundingHash,
  });
  mocks.api = createIntentsMockApi({
    storage: () => memoryStorage(),
    latencyMs: 0,
    depositAddress: "0x2222222222222222222222222222222222222222",
    getScenario: () => null,
  });
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  root = createRoot(document.createElement("div"));
});
afterEach(async () => {
  await act(async () => root.unmount());
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

async function startDeposit() {
  await render();
  await flush();
  expect(deposit$.catalog.status).toBe("ready");
  await act(async () => deposit$.setAmount(new BigNumber(2)));
  await act(async () => deposit$.requestPreview());
  await act(async () => {
    void deposit$.confirmQuote();
    void deposit$.confirmQuote();
  });
  await flush();
  expect(deposit$.review.phase).toBe("ready");
  await act(async () => {
    void deposit$.fund();
    void deposit$.fund();
  });
  await flush();
}

describe("1Click deposit inside Equiteez", () => {
  it("runs from one source funding action to a verified receipt", async () => {
    await startDeposit();
    expect(mocks.actions.writeContract).toHaveBeenCalledOnce();
    expect(mocks.actions.sendTransaction).not.toHaveBeenCalled();
    expect(deposit$.review.phase).toBe("tracking");
    expect(intentCards()).toHaveLength(1);

    // Close the modal (form reset), keep browsing, reopen: same operation.
    const localId = deposit$.activeRecord!.localId;
    await act(async () => deposit$.resetForm());
    expect(deposit$.review.phase).toBe("form");
    await flush(15_000);
    let resumed = false;
    await act(async () => {
      resumed = deposit$.resumeActive();
    });
    expect(resumed).toBe(true);
    expect(deposit$.review).toMatchObject({ phase: "tracking", localId });
    expect(deposit$.trackedModel?.state).toMatchObject({ status: "progress" });

    // Bridge processing: neutral, not success.
    await flush(60_000);
    expect(deposit$.trackedModel?.state).toMatchObject({ step: 4 });
    expect(mocks.success).not.toHaveBeenCalled();

    // Existing settlement data reports the forwarded deposit as executed.
    const backend = deposit$.activeRecord!.backend!;
    mocks.fetchDeposits.mockResolvedValue([
      deposit({
        evm_tx_hash: backend.forwardTxHash!,
        log_index: backend.forwardLogIndex!,
        status: "executed",
      }),
    ]);
    await act(async () => transactions.refresh());
    await flush();
    expect(deposit$.trackedModel?.state).toEqual({ status: "success" });
    expect(mocks.success).toHaveBeenCalledOnce();

    // Reload: nothing is resent or announced again, one card at most.
    await act(async () => root.unmount());
    root = createRoot(document.createElement("div"));
    await render();
    await act(async () => transactions.refresh());
    await flush();
    expect(mocks.actions.writeContract).toHaveBeenCalledOnce();
    expect(mocks.success).toHaveBeenCalledOnce();
    expect(
      widgets.models.filter((model) => model.kind === "intent").length
    ).toBeLessThanOrEqual(1);
  });

  it("recovers an unknown broadcast after reload without prompting again", async () => {
    mocks.actions.waitForTransactionReceipt.mockRejectedValue(
      new Error("RPC down")
    );
    await startDeposit();
    expect(deposit$.activeRecord?.fundingState).toBe("unknown");
    await act(async () => root.unmount());
    root = createRoot(document.createElement("div"));
    await render();
    let resumed = false;
    await act(async () => {
      resumed = deposit$.resumeActive();
    });
    expect(resumed).toBe(true);
    await act(async () => deposit$.fund()); // not "ready": no-op
    expect(mocks.actions.writeContract).toHaveBeenCalledOnce();
    // The hint already reached the backend, which keeps progressing.
    await flush(20_000);
    expect(deposit$.trackedModel?.state).toMatchObject({ status: "progress" });
  });

  it("isolates operations when the Equiteez account changes", async () => {
    await startDeposit();
    expect(intentCards()).toHaveLength(1);
    mocks.account = "mv1Fy1xTnD9s3xK3Uz2rNMhKgG5Jt5AKE8vj";
    await render();
    await flush();
    expect(deposit$.review.phase).toBe("form");
    expect(
      widgets.models.filter((model) => model.kind === "intent")
    ).toHaveLength(0);
    let resumed = true;
    await act(async () => {
      resumed = deposit$.resumeActive();
    });
    expect(resumed).toBe(false);
  });

  it("shows a refund as a final warning without asking for anything", async () => {
    mocks.api = createIntentsMockApi({
      storage: () => memoryStorage(),
      latencyMs: 0,
      depositAddress: "0x2222222222222222222222222222222222222222",
      getScenario: () => "refund",
    });
    await startDeposit();
    await flush(60_000);
    expect(deposit$.trackedModel).toMatchObject({
      isTerminal: true,
      state: { status: "warning", title: "Deposit refunded" },
    });
    expect(mocks.actions.writeContract).toHaveBeenCalledOnce();
  });

  it("keeps the deposit form usable when the service is down", async () => {
    mocks.api = {
      ...mocks.api,
      getRoutes: () => Promise.reject(new Error("offline")),
    };
    await render();
    await flush(5_000); // one catalog retry
    expect(deposit$.catalog.status).toBe("error");
    expect(deposit$.canReview).toBe(false);
  });
});
