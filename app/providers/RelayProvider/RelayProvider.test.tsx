// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { NotifierChannelHandler } from "~/providers/NotificationsProvider/notifications.provider.types";
import {
  NotifierConnectionStatus,
  NotifierServerFrameType,
} from "~/providers/NotificationsProvider/notifications.const";
import { updateRelayScopeIdentity } from "~/lib/relay/relay.scope";
import { RelayProvider, useRelay } from "./RelayProvider";
const mocks = vi.hoisted(() => ({
  wallet: "wallet",
  scope: "network-api-wallet",
  auth: true,
  pathname: "/trade/book",
  status: "connected",
  socketWallet: "wallet",
  list: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  validate: vi.fn(),
  notify: vi.fn(),
  warning: vi.fn(),
  refresh: vi.fn(),
  balances: vi.fn(),
  invalidate: vi.fn(),
  handler: null as NotifierChannelHandler | null,
}));
vi.mock("~/lib/apis/rwa/config", () => ({ rwaApiUrl: "https://api.test/" }));
vi.mock("@remix-run/react", () => ({
  useLocation: () => ({ pathname: mocks.pathname }),
}));
vi.mock("~/providers/GasPaymentProvider/GasPaymentProvider", () => {
  const toolkit = { rpc: { getRpcUrl: () => "rpc" } };
  return {
    useGasPayment: () => ({
      scope: mocks.scope,
      wallet: mocks.wallet,
      toolkit,
      chainId: "chain",
    }),
  };
});
vi.mock("~/providers/WalletProvider/wallet.provider", () => {
  const dapp = { getDAppClient: () => ({}) };
  return { useWalletContext: () => ({ dapp }) };
});
vi.mock("~/providers/AuthProvider/auth.provider", () => ({
  useAuthContext: () => ({
    isAuthenticated: mocks.auth,
    isAuthLoading: false,
    authenticatedWalletAddress: mocks.auth ? mocks.wallet : null,
  }),
}));
vi.mock("~/providers/UserProvider/user.provider", () => ({
  useUserContext: () => ({
    refetchUserAccountStatus: mocks.refresh,
    refetchUserBalances: mocks.balances,
  }),
}));
vi.mock("~/providers/ToasterProvider/toaster.provider", () => ({
  useToasterContext: () => ({ success: mocks.notify, warning: mocks.warning }),
}));
vi.mock("~/providers/NotificationsProvider/NotificationsProvider", () => ({
  useNotificationsContext: () => ({
    status: mocks.status,
    wallet: mocks.socketWallet,
  }),
}));
vi.mock("~/providers/NotificationsProvider/hooks/useNotifierEvent", () => ({
  useNotifierEvent: (
    _channel: unknown,
    _type: unknown,
    handler: NotifierChannelHandler
  ) => {
    mocks.handler = handler;
  },
}));
vi.mock("~/lib/apis/rwa/relay/relay", () => ({
  fetchRelayOperations: mocks.list,
  fetchRelayOperation: mocks.get,
  checkRelayOperationNow: mocks.get,
  submitRelayOperation: mocks.post,
  fetchRelayConfig: vi.fn(),
}));
vi.mock("~/lib/apis/rwa/freshness", () => ({
  FreshnessSource: { Orderbook: "orderbook" },
  useFreshQueryInvalidation: () => mocks.invalidate,
}));
vi.mock("~/providers/ApolloProvider/utils/observeForcedUpdate", () => ({
  forcedUpdateProxy: { hasForcedUpdate: false },
}));
vi.mock("~/contracts/permit", () => ({ assertPermitCurrent: mocks.validate }));
vi.mock("~/lib/atoms/RButton/RButton", () => ({
  RButton: ({
    children,
    onClick,
    disabled,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button
      aria-expanded={props["aria-expanded"]}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  ),
}));
const id = "11111111-1111-4111-8111-111111111111";
const intent = {
  kind: "process_refund",
  orderbookAddress: "book",
  orderId: "1",
  orderType: "BUY",
} as const;
const row = {
  operationId: id,
  gasStationOperationId: null,
  status: "pending",
  intentKind: intent.kind,
  intent,
  contractAddress: "book",
  permitVariant: "permitProcessRefund",
  opHash: null,
  feeChargedUnits: null,
  error: null,
  createdAt: "2026-10-22T00:00:00Z",
  updatedAt: "2026-10-22T00:00:01Z",
  settledAt: null,
};
let context: ReturnType<typeof useRelay>;
function Probe() {
  context = useRelay();
  return null;
}
let root: Root, container: HTMLDivElement, client: QueryClient;
async function render() {
  await act(async () => {
    root.render(
      <QueryClientProvider client={client}>
        <RelayProvider>
          <Probe />
        </RelayProvider>
      </QueryClientProvider>
    );
  });
}
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-22T00:00:30Z"));
  vi.clearAllMocks();
  window.localStorage.clear();
  mocks.wallet = "wallet";
  mocks.scope = "network-api-wallet";
  mocks.auth = true;
  mocks.status = "connected";
  mocks.socketWallet = "wallet";
  mocks.list.mockResolvedValue({ items: [row], nextCursor: null });
  mocks.get.mockResolvedValue({ operation: row });
  mocks.refresh.mockResolvedValue(undefined);
  mocks.balances.mockResolvedValue(undefined);
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  client.clear();
  vi.useRealTimers();
});
it("tracks open operations across remounts without a fabricated hash or a new POST", async () => {
  await render();
  expect(context.isReady).toBe(true);
  expect(context.records[0]).toMatchObject({
    operationId: id,
    state: "tracking",
  });
  expect(context.records[0].row?.opHash).toBeNull();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(600_000);
  });
  expect(mocks.get).toHaveBeenCalled();
  await act(async () => root.unmount());
  root = createRoot(container);
  await render();
  expect(context.records[0]).toMatchObject({ operationId: id });
  expect(mocks.post).not.toHaveBeenCalled();
});
it("only slows polling for this authenticated notifier wallet and keeps errors scoped", async () => {
  mocks.socketWallet = "other";
  await render();
  mocks.get.mockClear();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(3000);
  });
  expect(mocks.get).toHaveBeenCalledTimes(1);
  mocks.socketWallet = "wallet";
  await render();
  mocks.get.mockClear();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(3000);
  });
  expect(mocks.get).not.toHaveBeenCalled();
  mocks.status = NotifierConnectionStatus.Closed;
  await render();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(3000);
  });
  expect(mocks.get).toHaveBeenCalledTimes(1);
});
it("terminal events invalidate balances/order feeds without confirmation levels and notify once", async () => {
  await render();
  const frame = {
    type: NotifierServerFrameType.Event as const,
    event_id: "done",
    event_type: "RELAY_OPERATION_UPDATED",
    occurred_at: "2026-10-22T00:02:00Z",
    channel: "wallet",
    payload: {
      operationId: id,
      walletAddress: "wallet",
      status: "confirmed",
      updatedAt: "2026-10-22T00:02:00Z",
      opHash: "oHash",
    },
  };
  await act(async () => {
    await mocks.handler!(frame, "wallet");
  });
  expect(mocks.notify).toHaveBeenCalledTimes(1);
  expect(mocks.refresh).toHaveBeenCalled();
  expect(mocks.balances).toHaveBeenCalled();
  expect(mocks.invalidate).toHaveBeenCalledWith("fetchWalletOpenOrders", {
    source: "orderbook",
  });
  expect(context.records[0].row).toMatchObject({
    status: "confirmed",
    opHash: "oHash",
  });
  await act(async () => {
    await mocks.handler!(frame, "wallet");
  });
  expect(mocks.notify).toHaveBeenCalledTimes(1);
});
it("isolates account/API scope and restores only tracking when returning", async () => {
  await render();
  const oldRuntime = context.runtime!;
  const initial = oldRuntime.getScope().revision;
  mocks.list.mockResolvedValue({ items: [], nextCursor: null });
  mocks.wallet = "other";
  mocks.scope = "other-api-other-wallet";
  await render();
  expect(context.records).toEqual([]);
  mocks.wallet = "wallet";
  mocks.scope = "network-api-wallet";
  await render();
  expect(context.records).toHaveLength(1);
  expect(oldRuntime.getScope().revision).toBeGreaterThan(initial);
  expect(mocks.post).not.toHaveBeenCalled();
});
it("records synchronous away-and-back transitions before React can batch them", async () => {
  await render();
  const runtime = context.runtime!;
  const revision = runtime.getScope().revision;
  await act(async () => {
    updateRelayScopeIdentity("test-wallet", "away");
    updateRelayScopeIdentity("test-wallet", "back");
    expect(runtime.getScope().revision).toBeGreaterThan(revision);
  });
});
it("does not expose another wallet's rows while authentication is unresolved", async () => {
  await render();
  mocks.auth = false;
  await render();
  expect(context.records).toEqual([]);
  expect(context.isReady).toBe(false);
  expect(() => context.runtime!.getScope()).toThrow("sign in");
});
