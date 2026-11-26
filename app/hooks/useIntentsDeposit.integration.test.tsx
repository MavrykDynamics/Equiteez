// @vitest-environment jsdom
/**
 * EQ-FE-06: one 1Click deposit from request to verified receipt, inside
 * Equiteez, against the mock backend (API v0.0.9 contract) and the real
 * tracking providers. Wallet calls are mocked at the wagmi action boundary;
 * when the wallet "sends", the mock observes the deposit like 1Click would.
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BigNumber } from "bignumber.js";
import { act, createElement, StrictMode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { base } from "wagmi/chains";

import type { IntentsApi } from "~/lib/apis/intents";
import {
  createIntentsMockApi,
  simulateMockDeposit,
  type IntentsMockScenario,
} from "~/lib/apis/intents/intents.mock";
import {
  fixtureOption,
  fixtureSolanaOption,
  fixtureSolanaRefund,
  memoryStorage,
} from "~/lib/intents/intents.fixtures";
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
import { createFakeWalletAdapter } from "~/lib/intents/wallets/intentWallet.fixtures";
import {
  IntentWalletsProvider,
  useIntentWalletsContext,
} from "~/providers/IntentWalletsProvider/IntentWalletsProvider";
import { useIntentsDeposit } from "./useIntentsDeposit";

const account = "mv19MAVgCDwzuNMWprbHrUZhznoH8n9NWGWt";
const source = "0x1111111111111111111111111111111111111111" as const;
const fundingHash = `0x${"b".repeat(64)}` as const;

const mocks = vi.hoisted(() => ({
  account: "mv19MAVgCDwzuNMWprbHrUZhznoH8n9NWGWt" as string | null,
  scenario: null as IntentsMockScenario | null,
  api: null as unknown as IntentsApi,
  fetchDeposits: vi.fn(),
  success: vi.fn(),
  solana: null as unknown as ReturnType<typeof createFakeWalletAdapter>,
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

vi.mock("~/consts/intents", async (original) => {
  const actual = await original<typeof import("~/consts/intents")>();
  return {
    ...actual,
    INTENTS_ENV: "mock",
  };
});
vi.mock("~/lib/apis/intents", async (original) => ({
  ...(await original<typeof import("~/lib/apis/intents")>()),
  getIntentsApi: () => mocks.api,
}));
vi.mock("wagmi", () => ({
  useConfig: () => ({ chains: [base] }),
  useSwitchChain: () => ({ switchChainAsync: vi.fn(), isPending: false }),
}));
vi.mock("wagmi/actions", () => mocks.actions);
vi.mock("~/lib/intents/wallets", async (original) => ({
  ...(await original<typeof import("~/lib/intents/wallets")>()),
  isIntentWalletFamilySupported: (family: string) => family === "solana",
  loadIntentWalletAdapter: async () => mocks.solana,
}));
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
let wallets$!: ReturnType<typeof useIntentWalletsContext>;
const wallet = {
  userAddress: source,
  isConnected: true,
  chainId: base.id,
} as unknown as EthereumContext;

function Modal() {
  deposit$ = useIntentsDeposit({
    recipient: mocks.account,
    ethereumWallet: wallet,
  });
  widgets = useTransactionWidget();
  transactions = useTransactionsContext();
  wallets$ = useIntentWalletsContext();
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
            createElement(
              IntentWalletsProvider,
              null,
              createElement(
                TransactionWidgetProvider,
                null,
                createElement(Modal)
              )
            )
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
  mocks.scenario = null;
  mocks.success.mockReset();
  mocks.fetchDeposits.mockReset().mockResolvedValue([]);
  for (const action of Object.values(mocks.actions)) action.mockReset();
  mocks.actions.getAccount.mockReturnValue({
    isConnected: true,
    address: source,
    chainId: base.id,
  });
  mocks.actions.readContract.mockResolvedValue(10n ** 21n);
  // The transfer reaches 1Click, which the mock then observes.
  mocks.actions.writeContract.mockImplementation(async () => {
    const record = deposit$.activeRecord!;
    simulateMockDeposit(mocks.api, record.capability, record.operationId!);
    return fundingHash;
  });
  mocks.actions.waitForTransactionReceipt.mockResolvedValue({
    status: "success",
    transactionHash: fundingHash,
  });
  // A non-mock env: wallet sends are disabled against the "mock" env.
  mocks.api = {
    ...createIntentsMockApi({
      storage: () => memoryStorage(),
      latencyMs: 0,
      getScenario: () => mocks.scenario,
    }),
    env: "test",
  };
  mocks.solana = createFakeWalletAdapter("solana", {
    address: fixtureSolanaRefund,
    walletName: "Phantom",
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

/** Form → priced review → operation, for 25 USDC on Base. */
async function requestQuote() {
  await render();
  await flush();
  expect(deposit$.catalog.status).toBe("ready");
  await act(async () => deposit$.selectAsset(fixtureOption.assetId));
  await act(async () => deposit$.setAmount(new BigNumber(25)));
  // Typing is debounced before the preview is requested.
  await flush(1_000);
  await flush();
  expect(deposit$.previewStatus).toBe("ready");
  expect(deposit$.canReview).toBe(true);
  await act(async () => deposit$.startReview());
  expect(deposit$.review.phase).toBe("review");
  await act(async () => {
    void deposit$.confirmRequest();
    void deposit$.confirmRequest();
  });
  await flush();
  // Durable, but no quote yet: no funding prompt is possible.
  expect(deposit$.review.phase).toBe("operation");
  expect(deposit$.operationView).toEqual({ status: "preparing" });
  // The tracker polls GET (retryAfterMs 5s ± 10% jitter) until the backend
  // publishes instructions.
  await flush(6_000);
}

async function startDeposit() {
  await requestQuote();
  expect(deposit$.operationView).toEqual({ status: "ready" });
  await act(async () => {
    void deposit$.fund();
    void deposit$.fund();
  });
  await flush();
}

describe("1Click deposit inside Equiteez", () => {
  it("runs from one source funding action to a verified Mavryk settlement", async () => {
    await startDeposit();
    expect(mocks.actions.writeContract).toHaveBeenCalledOnce();
    const call = mocks.actions.writeContract.mock.calls[0][1];
    // The exact amount to the 1Click deposit address, never the forwarder.
    expect(call).toMatchObject({
      chainId: base.id,
      address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
      functionName: "transfer",
    });
    expect(call.args).toEqual([
      deposit$.activeRecord!.lastInstructions!.depositAddress,
      25_000_000n,
    ]);
    expect(mocks.actions.sendTransaction).not.toHaveBeenCalled();
    expect(deposit$.review.phase).toBe("tracking");
    expect(intentCards()).toHaveLength(1);

    // Close the modal (form reset), keep browsing, reopen: same operation.
    const localId = deposit$.activeRecord!.localId;
    await act(async () => deposit$.resetForm());
    expect(deposit$.review.phase).toBe("form");
    await flush(8_000);
    let resumed = false;
    await act(async () => {
      resumed = deposit$.resumeActive();
    });
    expect(resumed).toBe(true);
    expect(deposit$.review).toMatchObject({ phase: "tracking", localId });
    expect(deposit$.trackedModel?.state).toMatchObject({ status: "progress" });

    // WRAPPED with settlement PENDING: neutral, not success.
    await flush(16_000);
    expect(deposit$.trackedModel?.state).toMatchObject({
      status: "progress",
      step: 4,
    });
    expect(mocks.success).not.toHaveBeenCalled();

    // The backend confirms the mint on the expected FA2.
    await flush(15_000);
    expect(deposit$.trackedModel?.state).toEqual({
      status: "success",
      description: "24.921 wUSDT arrived in your Mavryk account.",
    });
    expect(mocks.success).toHaveBeenCalledOnce();

    // Reload: nothing is resent or announced again, one card at most.
    await act(async () => root.unmount());
    root = createRoot(document.createElement("div"));
    await render();
    await flush(5_000);
    expect(mocks.actions.writeContract).toHaveBeenCalledOnce();
    expect(mocks.success).toHaveBeenCalledOnce();
    expect(
      widgets.models.filter((model) => model.kind === "intent").length
    ).toBeLessThanOrEqual(1);
  });

  it("completes an untracked settlement only from verified bridge data on the wrap identity", async () => {
    mocks.scenario = "untracked";
    await startDeposit();
    await flush(60_000);
    expect(deposit$.trackedModel?.state).toMatchObject({ step: 4 });
    expect(mocks.success).not.toHaveBeenCalled();
    const [event] = deposit$.activeRecord!.backend!.forwarding.bridgeEvents;
    // A completion for the 1Click funding hash proves nothing.
    mocks.fetchDeposits.mockResolvedValue([
      deposit({ evm_tx_hash: fundingHash, log_index: 0, status: "executed" }),
    ]);
    await act(async () => transactions.refresh());
    await flush();
    expect(deposit$.trackedModel?.state).toMatchObject({ step: 4 });
    mocks.fetchDeposits.mockResolvedValue([
      deposit({
        evm_tx_hash: event.transactionHash,
        log_index: event.logIndex,
        status: "executed",
      }),
    ]);
    await act(async () => transactions.refresh());
    await flush();
    expect(deposit$.trackedModel?.state).toMatchObject({ status: "success" });
    expect(mocks.success).toHaveBeenCalledOnce();
  });

  it("never prompts the wallet when no quote meets the accepted minimum", async () => {
    mocks.scenario = "reject";
    await requestQuote();
    expect(deposit$.review.phase).toBe("form");
    expect(deposit$.reviewError).toMatch(/couldn't get a price/);
    expect(mocks.actions.writeContract).not.toHaveBeenCalled();
    expect(intentCards()).toHaveLength(0);
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
    await act(async () => deposit$.fund()); // tracking, not a quote: no-op
    expect(mocks.actions.writeContract).toHaveBeenCalledOnce();
    // 1Click saw the deposit; tracking continues without the wallet.
    await flush(20_000);
    expect(deposit$.activeRecord?.backend?.fundingStatus).toBe("OBSERVED");
    expect(deposit$.trackedModel?.state).toMatchObject({ status: "progress" });
  });

  it("pays a Solana deposit from any wallet and tracks it to receipt", async () => {
    await render();
    await flush();
    await act(async () => deposit$.selectAsset(fixtureSolanaOption.assetId));
    await act(async () => deposit$.setAmount(new BigNumber(1)));
    await act(async () => deposit$.setRefundInput(fixtureSolanaRefund));
    await act(async () => deposit$.setIsRefundConfirmed(true));
    await flush(1_000);
    await flush();
    expect(deposit$.canWalletSend).toBe(false);
    expect(deposit$.canReview).toBe(true);
    await act(async () => deposit$.startReview());
    await act(async () => deposit$.confirmRequest());
    await flush(6_000);
    expect(deposit$.operationView).toEqual({ status: "ready" });
    const record = deposit$.activeRecord!;
    expect(record.backend?.fundingInstructions).toMatchObject({
      sourceNetwork: "sol",
      amount: "1000000000",
    });
    expect(record.request.refundAddress).toBe(fixtureSolanaRefund);
    // The user sends from Phantom or an exchange, then says so.
    await act(async () => deposit$.markSent());
    expect(deposit$.review.phase).toBe("tracking");
    expect(intentCards()).toHaveLength(1);
    simulateMockDeposit(mocks.api, record.capability, record.operationId!);
    await flush(40_000);
    expect(deposit$.trackedModel?.state).toMatchObject({ status: "success" });
    expect(mocks.actions.writeContract).not.toHaveBeenCalled();
    expect(mocks.actions.sendTransaction).not.toHaveBeenCalled();
  });

  it("sends a Solana deposit from a connected Solana wallet", async () => {
    await render();
    await flush();
    await act(async () => deposit$.selectAsset(fixtureSolanaOption.assetId));
    await act(async () => {
      await wallets$.connect("solana", "fake");
    });
    await act(async () => deposit$.setAmount(new BigNumber(1)));
    await flush(1_000);
    await flush();
    expect(deposit$.canWalletSend).toBe(true);
    expect(deposit$.refundAddress).toBe(fixtureSolanaRefund);
    expect(deposit$.canReview).toBe(true);
    await act(async () => deposit$.startReview());
    await act(async () => deposit$.confirmRequest());
    await flush(6_000);
    expect(deposit$.operationView).toEqual({ status: "ready" });
    const record = deposit$.activeRecord!;
    // The wallet's transfer reaches 1Click, which the mock then observes.
    mocks.solana.onNextSend(async () => {
      simulateMockDeposit(mocks.api, record.capability, record.operationId!);
      return "5solanaSignature";
    });
    await act(async () => {
      void deposit$.fund();
      void deposit$.fund();
    });
    await flush();
    expect(mocks.solana.sends).toHaveLength(1);
    expect(mocks.solana.sends[0]).toMatchObject({
      from: fixtureSolanaRefund,
      to: record.backend!.fundingInstructions!.depositAddress,
      amount: 1_000_000_000n,
      asset: { kind: "native", symbol: "SOL", decimals: 9 },
    });
    expect(deposit$.activeRecord).toMatchObject({
      fundingState: "broadcast",
      sourceHashes: ["5solanaSignature"],
    });
    expect(deposit$.review.phase).toBe("tracking");
    expect(deposit$.trackedModel?.sourceExplorerUrl).toBe(
      "https://solscan.io/tx/5solanaSignature"
    );
    await flush(40_000);
    expect(deposit$.trackedModel?.state).toMatchObject({ status: "success" });
    expect(mocks.actions.sendTransaction).not.toHaveBeenCalled();
  });

  it("never prompts the Solana wallet again after it declined once", async () => {
    await render();
    await flush();
    await act(async () => deposit$.selectAsset(fixtureSolanaOption.assetId));
    await act(async () => {
      await wallets$.connect("solana", "fake");
    });
    await act(async () => deposit$.setAmount(new BigNumber(1)));
    await flush(1_000);
    await flush();
    await act(async () => deposit$.startReview());
    await act(async () => deposit$.confirmRequest());
    await flush(6_000);
    mocks.solana.onNextSend(() =>
      Promise.reject(Object.assign(new Error("User rejected"), { code: 4001 }))
    );
    await act(async () => deposit$.fund());
    expect(deposit$.activeRecord?.fundingState).toBe("rejected");
    // Declined: nothing was sent, so a new request is allowed.
    mocks.solana.onNextSend(() => Promise.reject(new Error("Network glitch")));
    await act(async () => deposit$.fund());
    expect(deposit$.activeRecord?.fundingState).toBe("unknown");
    await act(async () => deposit$.fund());
    expect(mocks.solana.sends).toHaveLength(2);
  });

  it("refuses to send after the wallet switched accounts", async () => {
    await render();
    await flush();
    await act(async () => deposit$.selectAsset(fixtureSolanaOption.assetId));
    await act(async () => {
      await wallets$.connect("solana", "fake");
    });
    await act(async () => deposit$.setAmount(new BigNumber(1)));
    await flush(1_000);
    await flush();
    await act(async () => deposit$.startReview());
    await act(async () => deposit$.confirmRequest());
    await flush(6_000);
    mocks.solana.switchAccount("9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin");
    await act(async () => deposit$.fund());
    expect(mocks.solana.sends).toHaveLength(0);
    expect(deposit$.fundingError).toMatch(/source wallet changed/);
    expect(deposit$.activeRecord?.fundingState).toBe("not_started");
  });

  it("isolates operations when the Equiteez account changes", async () => {
    await startDeposit();
    expect(intentCards()).toHaveLength(1);
    mocks.account = `mv1${"2".repeat(33)}`;
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

  it("shows a reported refund as a final warning without asking for anything", async () => {
    mocks.scenario = "refund";
    await startDeposit();
    await flush(60_000);
    expect(deposit$.trackedModel).toMatchObject({
      isTerminal: true,
      state: { status: "warning", title: "Refund reported" },
    });
    expect(mocks.actions.writeContract).toHaveBeenCalledOnce();
  });

  it("keeps the deposit form usable when the service is down", async () => {
    mocks.api = {
      ...mocks.api,
      getMetadata: () => Promise.reject(new Error("offline")),
    };
    await render();
    await flush(5_000); // one catalog retry
    expect(deposit$.catalog.status).toBe("error");
    expect(deposit$.canReview).toBe(false);
  });
});
