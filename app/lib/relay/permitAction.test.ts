import { beforeEach, describe, expect, it, vi } from "vitest";

type Deps = { changed: () => void; confirmed: () => void };

const mocks = vi.hoisted(() => {
  class FakePlan {
    state = "idle";
    prepared: object | null = null;
    error: unknown = null;
    review = vi.fn(async () => {
      if (mocks.reviewError) {
        this.error = mocks.reviewError;
        this.set("failed");
        return;
      }
      this.prepared = {};
      this.state = "review";
    });
    validateReview = vi.fn(async () => undefined);
    submit = vi.fn(async () => {
      this.state = "tracking";
    });
    stop = vi.fn();
    constructor(
      readonly request: unknown,
      readonly deps: Deps
    ) {
      mocks.plans.push(this);
    }
    set(state: string) {
      this.state = state;
      this.deps.changed();
    }
  }

  return {
    FakePlan,
    sign: vi.fn(),
    plans: [] as FakePlan[],
    reviewError: null as unknown,
  };
});

vi.mock("~/contracts/permit", () => ({ signPreparedPermit: mocks.sign }));
vi.mock("./orderPlan", () => ({ OrderPlan: mocks.FakePlan }));

import type { OrderPlanRequest } from "./orderPlan";
import { startPermitAction } from "./permitAction";
import { RelayApiError } from "./relay.errors";

const request: OrderPlanRequest = {
  kind: "process_refund",
  orderbookAddress: "book",
  orders: [{ orderId: "1", orderType: "BUY" }],
};
const deps = {
  runtime: {},
  validate: vi.fn(),
  isLocked: () => false,
  records: () => [],
  submit: vi.fn(),
} as unknown as Parameters<typeof startPermitAction>[1];
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("startPermitAction", () => {
  beforeEach(() => {
    mocks.plans.length = 0;
    mocks.reviewError = null;
    mocks.sign.mockReset().mockResolvedValue({ signed: true });
  });

  it("reviews, signs once, submits and resolves on confirmation", async () => {
    const steps: string[] = [];
    const { done } = startPermitAction(request, deps, (step) =>
      steps.push(step)
    );
    await flush();
    const plan = mocks.plans[0];

    // review() just validated; the plan revalidates before its POST.
    expect(plan.validateReview).not.toHaveBeenCalled();
    expect(mocks.sign).toHaveBeenCalledOnce();
    expect(plan.submit).toHaveBeenCalledWith({ signed: true });
    expect(steps).toEqual(["preparing", "signing", "processing"]);

    plan.deps.confirmed();
    await expect(done).resolves.toBeUndefined();
  });

  it("rejects without a signature when review fails", async () => {
    mocks.reviewError = new Error("not claimable");
    const { done } = startPermitAction(request, deps);

    await expect(done).rejects.toThrow("not claimable");
    expect(mocks.sign).not.toHaveBeenCalled();
  });

  it("stops the plan when the wallet rejects the signature", async () => {
    mocks.sign.mockRejectedValueOnce(new Error("Aborted"));
    const { done } = startPermitAction(request, deps);

    await expect(done).rejects.toThrow("Aborted");
    expect(mocks.plans[0].stop).toHaveBeenCalled();
  });

  it("rejects with the relay error when tracking fails", async () => {
    const { done } = startPermitAction(request, deps);
    await flush();
    const plan = mocks.plans[0];
    const error = new RelayApiError(undefined, "SIMULATION_FAILED", "give-up");
    plan.error = error;
    plan.set("failed");

    await expect(done).rejects.toBe(error);
  });

  it("asks for the next signature after a confirmed setup step", async () => {
    const { done } = startPermitAction(request, deps);
    await flush();
    const plan = mocks.plans[0];
    plan.set("next");
    await flush();

    expect(mocks.sign).toHaveBeenCalledTimes(2);
    plan.deps.confirmed();
    await expect(done).resolves.toBeUndefined();
  });
});
