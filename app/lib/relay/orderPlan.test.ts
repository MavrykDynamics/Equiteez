import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  OrderPlan,
  type OrderPlanRequest,
  type SignedPermit,
} from "./orderPlan";
import { RelayApiError } from "./relay.errors";
import type { RelayRecord } from "./relay.storage";
import type { PermitRuntime, PreparedPermit } from "~/contracts/permit";
import type {
  RelayConfig,
  RelayIntent,
} from "~/lib/apis/rwa/relay/relay.types";

const mocks = vi.hoisted(() => ({
  prepare: vi.fn(),
  operator: vi.fn(),
  credits: vi.fn(),
  build: vi.fn(),
}));
vi.mock("~/contracts/permit", () => ({ preparePermit: mocks.prepare }));
vi.mock("~/contracts/orderbookPermit", () => ({
  readPermitOperator: mocks.operator,
  buildPermitAction: mocks.build,
}));
vi.mock("~/lib/apis/rwa/relay/relay", () => ({
  fetchRelayCredits: mocks.credits,
}));
const request = (side = "buy", market = false): OrderPlanRequest => ({
  kind: side === "buy" ? "place_buy_order" : "place_sell_order",
  book: {
    address: "book",
    baseTokenAddress: "base",
    quoteTokenAddress: "quote",
    quoteTokenId: "0",
    rwaTokenId: "0",
    currencyKey: "USD",
    tickSize: "1",
    quantityTickSize: "1",
    minBuyOrderAmount: "1",
    minSellOrderAmount: "1",
    minBuyOrderValue: "1",
    minSellOrderValue: "1",
  },
  order: {
    rwaTokenAmount: "20",
    pricePerRwaToken: "30",
    currency: "USD",
    orderExpiry: null,
    isMarketOrder: market,
    baseTokenDecimals: 0,
  },
});
function intent(
  input: OrderPlanRequest | { kind: "update_operators" }
): RelayIntent {
  if (input.kind === "update_operators")
    return {
      kind: input.kind,
      tokenAddress: "quote",
      tokenId: "0",
      operator: "book",
      operatorAction: "add_operator",
    };
  if ("book" in input)
    return {
      kind: input.kind,
      orderbookAddress: "book",
      rwaTokenAmount: "20",
      pricePerRwaToken: "30",
      currency: "USD",
      orderExpiry: null,
      isMarketOrder: input.order.isMarketOrder,
    };
  return input.kind === "cancel_orders"
    ? { kind: input.kind, orderbookAddress: "book", orders: input.orders }
    : { kind: input.kind, orderbookAddress: "book", ...input.order };
}
function fixture(input = request()) {
  const records: RelayRecord[] = [];
  let revision = 0;
  let config: RelayConfig = {
    enabled: true,
    fee: { enabled: false },
    contracts: [],
    gaslessThresholdMumav: "0",
  };
  const runtime = {
    getScope: () => ({ wallet: "wallet", revision }),
    refreshConfig: vi.fn(async () => config),
    tezos: {},
  } as unknown as PermitRuntime;
  const validate = vi.fn(async () => {});
  const confirmed = vi.fn();
  const locked = vi.fn(() => false);
  const submit = vi.fn(
    async (signed: SignedPermit, onAttempt: (id: string) => void) => {
      const id = String(records.length);
      onAttempt(id);
      records.push({
        version: 1,
        id,
        scope: "scope",
        method: "credits",
        contract: signed.prepared.built.contract,
        intent: signed.ordinary!.intent,
        identity: "",
        state: "tracking",
        createdAt: 0,
        posts: 1,
        nextRetryAt: 0,
        minimized: false,
        dismissed: false,
        operationId: id,
        payload: signed.ordinary!,
      });
      return id;
    }
  );
  mocks.build.mockImplementation((input) => ({
    variant: input.kind,
    intent: intent(input),
  }));
  mocks.prepare.mockImplementation(
    async (_runtime, step) =>
      ({
        request: step,
        payload: "payload",
        built: {
          intent: intent(step),
          contract: step.kind === "update_operators" ? "quote" : "book",
        },
      }) as PreparedPermit
  );
  const plan = new OrderPlan(input, {
    runtime,
    validate,
    isLocked: locked,
    records: () => records,
    submit,
    changed: vi.fn(),
    confirmed,
  });
  const sign = async () => {
    const prepared = plan.prepared!;
    const operation = {
      to: prepared.built.contract,
      parameter: { entrypoint: "permitAndExecute" as const, value: [{}] },
    };
    await plan.submit({
      prepared,
      operation,
      ordinary: { intent: prepared.built.intent!, operation },
      topUp: null,
    } as SignedPermit);
  };
  const settle = (
    status: "confirmed" | "failed" | "rejected",
    error: { code: string; message: string; remedy: "re-sign" } | null = null
  ) => {
    const record = records.at(-1)!;
    record.state = "settled";
    record.row = {
      operationId: record.id,
      status,
      intent: record.intent,
      intentKind: record.intent!.kind,
      contractAddress: record.contract,
      updatedAt: new Date().toISOString(),
      error,
    };
    plan.reconcile();
  };
  return {
    plan,
    sign,
    settle,
    records,
    validate,
    confirmed,
    submit,
    locked,
    runtime,
    switchWallet: () => {
      revision++;
    },
    setConfig: (value: RelayConfig) => {
      config = value;
    },
  };
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.operator.mockResolvedValue({ needsGrant: false });
});
describe("sequential ordinary plans", () => {
  it.each(["buy", "sell"])(
    "fresh %s waits for confirmed grant and explicit next review",
    async (side) => {
      mocks.operator.mockResolvedValue({ needsGrant: true });
      const f = fixture(request(side));
      await f.plan.review();
      expect(f.plan.prepared?.request.kind).toBe("update_operators");
      await f.sign();
      expect(f.plan.state).toBe("tracking");
      expect(f.confirmed).not.toHaveBeenCalled();
      await f.plan.review();
      expect(mocks.prepare).toHaveBeenCalledTimes(1);
      f.settle("confirmed");
      expect(f.plan.state).toBe("next");
      expect(f.confirmed).not.toHaveBeenCalled();
      mocks.operator.mockResolvedValue({ needsGrant: false });
      await f.plan.review();
      expect(f.plan.prepared?.request.kind).toBe(`place_${side}_order`);
      await f.sign();
      expect(f.confirmed).not.toHaveBeenCalled();
      f.settle("confirmed");
      f.plan.reconcile();
      expect(f.confirmed).toHaveBeenCalledTimes(1);
      expect(f.validate.mock.calls.length).toBeGreaterThanOrEqual(4);
    }
  );
  it.each([
    ["buy", false],
    ["sell", false],
    ["buy", true],
    ["sell", true],
  ] as const)(
    "returning %s market=%s retains exact order",
    async (side, market) => {
      const input = request(side, market);
      const f = fixture(input);
      await f.plan.review();
      expect(f.plan.prepared?.request).toEqual(input);
      await f.sign();
      expect(f.records).toHaveLength(1);
    }
  );
  it.each(["failed", "rejected"] as const)(
    "%s setup never requests order signature",
    async (status) => {
      mocks.operator.mockResolvedValue({ needsGrant: true });
      const f = fixture();
      await f.plan.review();
      await f.sign();
      f.settle(status);
      await f.plan.review();
      expect(mocks.prepare).toHaveBeenCalledTimes(1);
      expect(f.confirmed).not.toHaveBeenCalled();
    }
  );
  it("revalidates changed state after setup", async () => {
    mocks.operator.mockResolvedValue({ needsGrant: true });
    const f = fixture();
    await f.plan.review();
    await f.sign();
    f.settle("confirmed");
    f.validate.mockRejectedValueOnce(new Error("Price changed"));
    await f.plan.review();
    expect(f.plan.state).toBe("failed");
    expect(mocks.prepare).toHaveBeenCalledTimes(1);
  });
  it("requires readable present operator after confirmed setup", async () => {
    mocks.operator.mockResolvedValue({ needsGrant: true });
    const f = fixture();
    await f.plan.review();
    await f.sign();
    f.settle("confirmed");
    await f.plan.review();
    expect(f.plan.state).toBe("failed");
    expect(mocks.prepare).toHaveBeenCalledTimes(1);
  });
  it("rejects away-and-back wallet revision before submit", async () => {
    const f = fixture();
    await f.plan.review();
    f.switchWallet();
    await f.sign();
    expect(f.submit).not.toHaveBeenCalled();
    expect(f.plan.state).toBe("failed");
  });
  it("keeps an unknown attempt tracking and cannot re-sign", async () => {
    const f = fixture();
    const original = f.submit.getMockImplementation()!;
    f.submit.mockImplementation(async (signed, onAttempt) => {
      await original(signed, onAttempt);
      f.records[0].state = "unknown";
      throw new RelayApiError(undefined, "NETWORK_UNKNOWN", "retry");
    });
    await f.plan.review();
    await f.sign();
    expect(f.plan.state).toBe("tracking");
    expect(f.plan.canResign).toBe(false);
    f.settle("confirmed");
    expect(f.confirmed).toHaveBeenCalledOnce();
  });
  it("unrelated adopted work cannot complete this plan", async () => {
    const f = fixture();
    await f.plan.review();
    await f.sign();
    f.settle("failed");
    f.records[0].row!.status = "confirmed";
    f.records[0].row!.intent = { kind: "cancel_orders" };
    f.plan.state = "tracking";
    f.plan.reconcile();
    expect(f.confirmed).not.toHaveBeenCalled();
    expect(f.plan.state).toBe("failed");
  });
  it("bounds explicit re-sign reviews to two after terminal unusable permits", async () => {
    const f = fixture();
    await f.plan.review();
    for (let i = 0; i < 3; i++) {
      await f.sign();
      f.settle("failed", {
        code: "PERMIT_EXPIRED",
        message: "expired",
        remedy: "re-sign",
      });
      expect(f.plan.canResign).toBe(i < 2);
      await f.plan.review();
    }
    expect(mocks.prepare).toHaveBeenCalledTimes(3);
  });
  it("stops before any signature when a token slot is locked", async () => {
    const f = fixture();
    f.locked.mockReturnValue(true);
    await f.plan.review();
    expect(mocks.prepare).not.toHaveBeenCalled();
  });
  it.each(["cancel_orders", "process_refund"] as const)(
    "%s is one free permit, no operator read or credits read",
    async (kind) => {
      const f = fixture(
        kind === "cancel_orders"
          ? {
              kind,
              orderbookAddress: "book",
              orders: [
                { orderId: "0", orderType: "BUY", orderbookAddress: "book" },
              ],
            }
          : {
              kind,
              orderbookAddress: "book",
              order: { orderId: "0", orderType: "BUY" },
            }
      );
      await f.plan.review();
      await f.sign();
      f.settle("confirmed");
      expect(f.confirmed).toHaveBeenCalledOnce();
      expect(mocks.operator).not.toHaveBeenCalled();
      expect(mocks.credits).not.toHaveBeenCalled();
    }
  );
  it("top-up-required order stops before quote grant and counter preparation", async () => {
    const f = fixture();
    f.setConfig({
      enabled: true,
      contracts: [],
      gaslessThresholdMumav: "0",
      fee: {
        enabled: true,
        tokenContract: "quote",
        tokenId: 0,
        decimals: 6,
        collector: "collector",
        feeSchedule: { place_buy_order: "100" },
        defaultFeeUnits: "100",
        topUpMinUnits: "1",
        topUpMaxUnits: "1000",
        freeAllowanceOps: 5,
        entrypoint: "permitAndExecute",
      },
    });
    mocks.credits.mockResolvedValue({
      enabled: true,
      balanceUnits: "0",
      decimals: 6,
      actionsRemaining: {},
      freeAllowanceRemaining: 0,
    });
    await f.plan.review();
    expect(f.plan.state).toBe("failed");
    expect(f.plan.error).toMatchObject({ code: "FEE_CREDIT_REQUIRED" });
    expect(mocks.prepare).not.toHaveBeenCalled();
    expect(mocks.operator).not.toHaveBeenCalled();
  });
  it("free actions skip paid reads even with fees enabled and an empty balance", async () => {
    const f = fixture({
      kind: "process_refund",
      orderbookAddress: "book",
      order: { orderId: "1", orderType: "BUY" },
    });
    f.setConfig({
      enabled: true,
      contracts: [],
      gaslessThresholdMumav: "0",
      fee: {
        enabled: true,
        tokenContract: "quote",
        tokenId: 0,
        decimals: 6,
        collector: "collector",
        feeSchedule: { place_buy_order: "100" },
        defaultFeeUnits: "100",
        topUpMinUnits: "1",
        topUpMaxUnits: "1000",
        freeAllowanceOps: 5,
        entrypoint: "permitAndExecute",
      },
    });
    await f.plan.review();
    expect(f.plan.state).toBe("review");
    expect(mocks.credits).not.toHaveBeenCalled();
  });
  it("client-bug verdicts never offer repeated signatures", async () => {
    const f = fixture();
    await f.plan.review();
    await f.sign();
    f.settle("failed", {
      code: "INTENT_MISMATCH",
      message: "bug",
      remedy: "re-sign",
    });
    expect(f.plan.canResign).toBe(false);
    await f.plan.review();
    expect(mocks.prepare).toHaveBeenCalledTimes(1);
  });
});
