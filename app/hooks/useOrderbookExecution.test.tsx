// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { useOrderbookExecution } from "./useOrderbookExecution";
import type { OrderPlan } from "~/lib/relay/orderPlan";
import type { RelayRecord } from "~/lib/relay/relay.storage";
const mocks = vi.hoisted(() => ({
  method: "credits",
  records: [] as RelayRecord[],
  validate: vi.fn(),
  submit: vi.fn(),
  direct: vi.fn(),
  confirmed: vi.fn(),
  kyced: true,
  revision: 0,
  prepare: vi.fn(),
  currentPlan: null as OrderPlan | null,
}));
vi.mock("~/providers/AuthProvider/auth.provider", () => ({
  useAuthContext: () => ({ isAuthenticated: true, login: vi.fn() }),
}));
vi.mock("~/contracts/permit", () => ({ preparePermit: mocks.prepare }));
vi.mock("~/contracts/orderbookPermit", () => ({
  buildPermitAction: () => ({ variant: "permitCancelOrders" }),
  readPermitOperator: vi.fn(),
}));
vi.mock("~/contracts/orderPlanValidation", () => ({
  validateOrderPlan: mocks.validate,
}));
vi.mock("~/lib/apis/rwa/relay/relay", () => ({ fetchRelayCredits: vi.fn() }));
vi.mock("@apollo/client/index", () => ({
  useApolloClient: () => ({
    query: async () => ({
      data: {
        kyc_member: mocks.kyced ? [{ user: { address: "wallet" } }] : [],
      },
    }),
  }),
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
      refreshConfig: async () => ({ enabled: true, fee: { enabled: false } }),
    },
    records: mocks.records,
    isReady: true,
    isLocked: () => mocks.records.some((r) => r.state !== "settled"),
    submit: mocks.submit,
  }),
}));
vi.mock("~/lib/organisms/ROrderPlan/ROrderPlan", () => ({
  ROrderPlan: ({ plan }: { plan: OrderPlan }) => {
    mocks.currentPlan = plan;
    return <p>{plan.state}</p>;
  },
}));
(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;
let root: Root;
let container: HTMLDivElement;
let execution: ReturnType<typeof useOrderbookExecution>;
function Harness({ orderId = "1" }: { orderId?: string }) {
  execution = useOrderbookExecution({
    request: {
      kind: "cancel_orders",
      orderbookAddress: "book",
      orders: [{ orderbookAddress: "book", orderType: "BUY", orderId }],
    },
    invokeDirect: mocks.direct,
    onConfirmed: mocks.confirmed,
  });
  return <>{execution.controls}</>;
}
beforeEach(async () => {
  vi.clearAllMocks();
  mocks.records = [];
  mocks.method = "credits";
  mocks.kyced = true;
  mocks.revision = 0;
  mocks.currentPlan = null;
  mocks.prepare.mockImplementation(async (_r, request) => ({
    request,
    built: {
      contract: "book",
      intent: {
        kind: "cancel_orders",
        orderbookAddress: "book",
        orders: request.orders.map(
          ({ orderId, orderType }: { orderId: string; orderType: string }) => ({
            orderId,
            orderType,
          })
        ),
      },
    },
  }));
  mocks.submit.mockImplementation(async (signed, onAttempt) => {
    onAttempt("attempt");
    mocks.records = [
      {
        id: "attempt",
        state: "tracking",
        contract: "book",
        intent: signed.ordinary.intent,
      } as RelayRecord,
    ];
    return "op";
  });
  container = document.createElement("div");
  root = createRoot(container);
  await act(async () => root.render(<Harness />));
});
afterEach(async () => {
  await act(async () => root.unmount());
});
async function sign() {
  const prepared = mocks.currentPlan!.prepared!;
  await act(async () => {
    await mocks.currentPlan!.submit({
      prepared,
      ordinary: { intent: prepared.built.intent! },
      operation: {},
      topUp: null,
    } as Parameters<OrderPlan["submit"]>[0]);
  });
}
it("direct mode invokes only the existing direct action", async () => {
  mocks.method = "mvrk";
  await act(async () => root.render(<Harness />));
  await act(async () => execution.execute());
  expect(mocks.direct).toHaveBeenCalledOnce();
  expect(mocks.prepare).not.toHaveBeenCalled();
  expect(mocks.submit).not.toHaveBeenCalled();
  expect(mocks.confirmed).not.toHaveBeenCalled();
});
it("relay acceptance never completes the form; confirmed exact action does once", async () => {
  await act(async () => execution.execute());
  expect(container.textContent).toBe("review");
  await sign();
  expect(mocks.direct).not.toHaveBeenCalled();
  expect(mocks.confirmed).not.toHaveBeenCalled();
  const r = mocks.records[0];
  mocks.records = [
    {
      ...r,
      state: "settled",
      row: {
        operationId: "op",
        status: "confirmed",
        updatedAt: new Date().toISOString(),
        contractAddress: "book",
        intentKind: "cancel_orders",
        intent: r.intent,
      },
    },
  ];
  await act(async () => root.render(<Harness />));
  expect(mocks.confirmed).toHaveBeenCalledOnce();
  await act(async () => root.render(<Harness />));
  expect(mocks.confirmed).toHaveBeenCalledOnce();
});
it("changed inputs require fresh review and remain intact on failure", async () => {
  await act(async () => execution.execute());
  await act(async () => root.render(<Harness orderId="2" />));
  await sign();
  expect(mocks.submit).not.toHaveBeenCalled();
  expect(mocks.confirmed).not.toHaveBeenCalled();
  expect(container.textContent).toBe("failed");
});
it("saved mode change does not redirect a reviewed Credits action", async () => {
  await act(async () => execution.execute());
  mocks.method = "mvrk";
  await act(async () => root.render(<Harness />));
  await sign();
  expect(mocks.submit).toHaveBeenCalledOnce();
  expect(mocks.direct).not.toHaveBeenCalled();
});
it("fresh order validation rejection prevents review/signing", async () => {
  mocks.validate.mockRejectedValueOnce(
    new Error("Order is no longer claimable")
  );
  await act(async () => execution.execute());
  expect(mocks.prepare).not.toHaveBeenCalled();
  expect(container.textContent).toBe("failed");
});
it("remount never resumes a remaining signature", async () => {
  await act(async () => execution.execute());
  await sign();
  await act(async () => root.unmount());
  root = createRoot(container);
  await act(async () => root.render(<Harness />));
  expect(mocks.prepare).toHaveBeenCalledOnce();
  expect(container.textContent).toBe("");
});
