// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useOrderbookExecution } from "./useOrderbookExecution";
import type { OrderPlanRequest } from "~/lib/relay/orderPlan";
import { RelayApiError } from "~/lib/relay/relay.errors";

type StartDeps = {
  validate: (request: OrderPlanRequest, runtime: never) => Promise<void>;
};
const mocks = vi.hoisted(() => ({
  method: "credits",
  validate: vi.fn(),
  direct: vi.fn(),
  confirmed: vi.fn(),
  bug: vi.fn(),
  kyced: true,
  revision: 0,
  start: vi.fn(),
  plan: { reconcile: vi.fn(), stop: vi.fn() },
  settle: null as null | ((error?: unknown) => void),
  deps: null as null | StartDeps,
  reload: vi.fn(),
  reviewRuntime: { review: true } as never,
  loading: vi.fn(() => "toast-1"),
  hide: vi.fn(),
  onStep: null as null | ((step: string) => void),
  pendingToast: undefined as undefined | { title: string; message: string },
  inline: false,
  config: undefined as unknown,
}));
const readyConfig = (permitActions = ["permitCancelOrders"]) => ({
  state: "ready",
  config: {
    enabled: true,
    fee: { enabled: false },
    contracts: [{ address: "book", kind: "orderbook", permitActions }],
    gaslessThresholdMumav: "0",
  },
});
vi.mock("~/lib/apis/rwa/relay/relay", () => ({
  relayConfigQueryOptions: (scope: string) => ({
    queryKey: ["relay", scope, "config"],
  }),
}));
vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({ data: mocks.config }),
}));
vi.mock("~/lib/relay/permitAction", () => ({
  startPermitAction: mocks.start,
  getPermitActionErrorMessage: (error: unknown) =>
    error instanceof Error ? error.message : undefined,
}));
vi.mock("~/lib/relay/orderPlan", () => ({
  isRelayOutcomeError: (error: unknown) =>
    (error as { outcome?: boolean } | null)?.outcome === true,
}));
vi.mock("~/contracts/orderPlanValidation", () => ({
  validateOrderPlan: mocks.validate,
}));
vi.mock("@apollo/client/index", () => ({
  useApolloClient: () => ({
    query: async () => ({
      data: {
        kyc_member: mocks.kyced ? [{ user: { address: "wallet" } }] : [],
      },
    }),
  }),
}));
vi.mock("~/providers/ToasterProvider/toaster.provider", () => ({
  useToasterContext: () => ({
    bug: mocks.bug,
    loading: mocks.loading,
    hideToasterMessage: mocks.hide,
  }),
}));
vi.mock("~/providers/UserProvider/user.provider", () => ({
  useUserContext: () => ({ isKyced: mocks.kyced }),
}));
vi.mock("~/providers/GasPaymentProvider/GasPaymentProvider", () => ({
  useGasPayment: () => ({
    method: mocks.method,
    isRestored: true,
    scope: "scope",
    wallet: "wallet",
    reload: mocks.reload,
  }),
}));
vi.mock("~/providers/RelayProvider/RelayProvider", () => ({
  useRelay: () => ({
    runtime: {
      getScope: () => ({ wallet: "wallet", revision: mocks.revision }),
    },
    records: [],
    isReady: true,
    isLocked: () => false,
    submit: vi.fn(),
  }),
}));
(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root;
let execution: ReturnType<typeof useOrderbookExecution>;
const toRequest = (orderId: string): OrderPlanRequest => ({
  kind: "cancel_orders",
  orderbookAddress: "book",
  orders: [{ orderbookAddress: "book", orderType: "BUY", orderId }],
});
function Harness({ orderId = "1" }: { orderId?: string }) {
  execution = useOrderbookExecution({
    request: toRequest(orderId),
    invokeDirect: mocks.direct,
    onConfirmed: mocks.confirmed,
    inlineNotice: mocks.inline,
    pendingToast: mocks.pendingToast,
  });
  return null;
}
beforeEach(async () => {
  vi.clearAllMocks();
  mocks.method = "credits";
  mocks.kyced = true;
  mocks.revision = 0;
  mocks.settle = null;
  mocks.deps = null;
  mocks.inline = false;
  mocks.config = readyConfig();
  mocks.pendingToast = undefined;
  mocks.onStep = null;
  mocks.start.mockImplementation((_request, deps: StartDeps, onStep) => {
    mocks.deps = deps;
    mocks.onStep = onStep;
    const done = new Promise<void>((resolve, reject) => {
      mocks.settle = (error) => (error ? reject(error) : resolve());
    });
    return { plan: mocks.plan, done };
  });
  root = createRoot(document.createElement("div"));
  await act(async () => root.render(<Harness />));
});
afterEach(async () => {
  await act(async () => root.unmount());
});
async function start() {
  let running!: Promise<void>;
  await act(async () => {
    running = execution.execute();
  });
  return { running };
}
async function settle(error?: unknown, running?: Promise<void>) {
  await act(async () => {
    mocks.settle!(error);
    await running;
  });
}
it("direct mode invokes only the existing direct action", async () => {
  mocks.method = "mvrk";
  await act(async () => root.render(<Harness />));
  await act(async () => execution.execute());
  expect(mocks.direct).toHaveBeenCalledOnce();
  expect(mocks.start).not.toHaveBeenCalled();
  expect(mocks.confirmed).not.toHaveBeenCalled();
});
it("Credits mode starts the permit action without a plan dialog", async () => {
  const { running } = await start();
  expect(mocks.start).toHaveBeenCalledOnce();
  expect(mocks.start.mock.calls[0][0]).toEqual(toRequest("1"));
  expect(execution.isBusy).toBe(true);
  expect(execution.status).toBe("STATUS_PENDING");
  expect(mocks.confirmed).not.toHaveBeenCalled();
  await settle(undefined, running);
  expect(mocks.confirmed).toHaveBeenCalledOnce();
  expect(mocks.direct).not.toHaveBeenCalled();
  expect(execution.isBusy).toBe(false);
  expect(execution.status).toBe("STATUS_IDLE");
});
it("ignores a second confirm while an action is running", async () => {
  const { running } = await start();
  await act(async () => void execution.execute());
  expect(mocks.start).toHaveBeenCalledOnce();
  await settle(undefined, running);
});
it("relay rows reconcile the running action", async () => {
  const { running } = await start();
  await act(async () => root.render(<Harness />));
  expect(mocks.plan.reconcile).toHaveBeenCalled();
  await settle(undefined, running);
});
it("validation rejects an order edited after the confirm click", async () => {
  const { running } = await start();
  await act(async () => root.render(<Harness orderId="2" />));
  await expect(
    mocks.deps!.validate(toRequest("1"), mocks.reviewRuntime)
  ).rejects.toThrow("The order or price changed");
  await settle(new Error("The order or price changed."), running);
  expect(mocks.confirmed).not.toHaveBeenCalled();
});
it("does not complete the form when the order changed before confirmation", async () => {
  const { running } = await start();
  await act(async () => root.render(<Harness orderId="2" />));
  await settle(undefined, running);
  expect(mocks.confirmed).not.toHaveBeenCalled();
});
it("validation requires fresh KYC", async () => {
  const { running } = await start();
  mocks.kyced = false;
  await expect(
    mocks.deps!.validate(toRequest("1"), mocks.reviewRuntime)
  ).rejects.toThrow("Verify with Mavryk Pro");
  // Balances are read alongside KYC, through the review's runtime.
  expect(mocks.validate).toHaveBeenCalledWith(
    mocks.reviewRuntime,
    toRequest("1")
  );
  await settle(new Error("x"), running);
});
it("shows a relay failure as a toast", async () => {
  const { running } = await start();
  await settle(new Error("Order is no longer claimable"), running);
  expect(mocks.bug).toHaveBeenCalledWith("Order is no longer claimable");
  expect(mocks.confirmed).not.toHaveBeenCalled();
  expect(execution.isBusy).toBe(false);
});
it("leaves a failed relay row to the RelayProvider toast", async () => {
  const { running } = await start();
  await settle(
    Object.assign(new Error("Rejected"), { outcome: true }),
    running
  );
  expect(mocks.bug).not.toHaveBeenCalled();
  expect(mocks.confirmed).not.toHaveBeenCalled();
});
it("stays silent when the wallet signature is rejected", async () => {
  const { running } = await start();
  await settle({ name: "UnknownBeaconError", title: "Aborted" }, running);
  expect(mocks.bug).not.toHaveBeenCalled();
});
it("unmount stops the running action", async () => {
  await start();
  await act(async () => root.unmount());
  expect(mocks.plan.stop).toHaveBeenCalledOnce();
  root = createRoot(document.createElement("div"));
});

const relayError = (code: string, retryAfterMs = 0) =>
  new RelayApiError(undefined, code, "give-up", undefined, retryAfterMs);
it("blocks an unsupported contract before signing", async () => {
  mocks.config = readyConfig([]);
  await act(async () => root.render(<Harness />));
  expect(execution.notice?.kind).toBe("unavailable");
  expect(execution.reason).toBe(execution.notice?.message);
  expect(execution.isReasonInline).toBe(true);
  await act(async () => execution.execute());
  expect(mocks.start).not.toHaveBeenCalled();
});
it("treats a failed config read as an outage, not relay off", async () => {
  mocks.config = {
    ...readyConfig(),
    state: "disabled",
    reason: "unavailable",
  };
  (mocks.config as ReturnType<typeof readyConfig>).config.enabled = false;
  await act(async () => root.render(<Harness />));
  expect(execution.notice?.reason).toBe(
    "Gas Station is temporarily unavailable."
  );
});
it("waits for the config without an alert", async () => {
  mocks.config = undefined;
  await act(async () => root.render(<Harness />));
  expect(execution.reason).toBeDefined();
  expect(execution.notice).toBeNull();
  expect(execution.isReasonInline).toBe(true);
});
it("keeps credit shortage inline instead of a toast", async () => {
  mocks.inline = true;
  await act(async () => root.render(<Harness />));
  const { running } = await start();
  await settle(relayError("FEE_CREDIT_REQUIRED"), running);
  expect(mocks.bug).not.toHaveBeenCalled();
  expect(execution.notice?.kind).toBe("credit-shortage");
  await act(async () => root.render(<Harness orderId="2" />));
  expect(execution.notice).toBeNull();
});
it("separates sponsor outage from credit shortage", async () => {
  mocks.inline = true;
  await act(async () => root.render(<Harness />));
  const { running } = await start();
  await settle(relayError("RELAY_UNAVAILABLE"), running);
  expect(execution.notice?.kind).toBe("unavailable");
});
it("toasts the readable notice where it cannot be shown inline", async () => {
  const { running } = await start();
  await settle(relayError("RELAY_QUOTA_EXCEEDED", 90_000), running);
  expect(mocks.bug).toHaveBeenCalledOnce();
  expect(execution.notice).toBeNull();
});
it("rereads the saved method on a payment mismatch", async () => {
  mocks.inline = true;
  await act(async () => root.render(<Harness />));
  const { running } = await start();
  await settle(relayError("PAYMENT_METHOD_MISMATCH"), running);
  expect(mocks.reload).toHaveBeenCalledOnce();
  expect(execution.notice?.kind).toBe("payment-mismatch");
  // The reread switches to MVRK; the explanation stays.
  mocks.method = "mvrk";
  await act(async () => root.render(<Harness />));
  expect(execution.notice?.kind).toBe("payment-mismatch");
});
it("shows the processing toast only while a signed permit is relayed", async () => {
  mocks.pendingToast = { title: "Processing", message: "Waiting" };
  await act(async () => root.render(<Harness />));
  const { running } = await start();
  await act(async () => mocks.onStep!("signing"));
  expect(mocks.loading).not.toHaveBeenCalled();
  await act(async () => mocks.onStep!("processing"));
  expect(mocks.loading).toHaveBeenCalledWith("Processing", "Waiting", false);
  // The order's own signature after an operator grant.
  await act(async () => mocks.onStep!("signing"));
  expect(mocks.hide).toHaveBeenCalledWith("toast-1");
  await act(async () => mocks.onStep!("processing"));
  expect(mocks.loading).toHaveBeenCalledTimes(2);
  await settle(undefined, running);
  expect(mocks.hide).toHaveBeenCalledTimes(2);
});
it("hides the processing toast when the relay fails", async () => {
  mocks.pendingToast = { title: "Processing", message: "Waiting" };
  await act(async () => root.render(<Harness />));
  const { running } = await start();
  await act(async () => mocks.onStep!("processing"));
  await settle(new Error("Rejected"), running);
  expect(mocks.hide).toHaveBeenCalledWith("toast-1");
});
