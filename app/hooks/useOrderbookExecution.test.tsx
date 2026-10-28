// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useOrderbookExecution } from "./useOrderbookExecution";
import type { OrderPlanRequest } from "~/lib/relay/orderPlan";

type StartDeps = {
  validate: (request: OrderPlanRequest) => Promise<void>;
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
  useToasterContext: () => ({ bug: mocks.bug }),
}));
vi.mock("~/providers/UserProvider/user.provider", () => ({
  useUserContext: () => ({ isKyced: mocks.kyced }),
}));
vi.mock("~/providers/GasPaymentProvider/GasPaymentProvider", () => ({
  useGasPayment: () => ({ method: mocks.method, isRestored: true }),
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
  mocks.start.mockImplementation((_request, deps: StartDeps) => {
    mocks.deps = deps;
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
  await expect(mocks.deps!.validate(toRequest("1"))).rejects.toThrow(
    "The order or price changed"
  );
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
  await expect(mocks.deps!.validate(toRequest("1"))).rejects.toThrow(
    "Verify with Mavryk Pro"
  );
  expect(mocks.validate).not.toHaveBeenCalled();
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
