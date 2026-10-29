import { signPreparedPermit } from "~/contracts/permit";
import { OrderPlan, type OrderPlanRequest } from "./orderPlan";
import { RelayApiError } from "./relay.errors";
import { getRelayFailureNotice } from "./relayFailure";

type PlanDependencies = ConstructorParameters<typeof OrderPlan>[1];

export type PermitActionStep = "preparing" | "signing" | "processing";

export type PermitActionHandle = {
  plan: OrderPlan;
  /** Resolves on a confirmed relay row; rejects on any failure or wallet rejection. */
  done: Promise<void>;
};

/**
 * Drives one OrderPlan without its dialogs: review → validate → wallet
 * signature → submit → relay confirmation. The caller's own UI is the review,
 * so the wallet prompt opens straight after the user's confirm click.
 * Call `plan.reconcile()` whenever relay records change.
 */
export function startPermitAction(
  request: OrderPlanRequest,
  deps: Omit<PlanDependencies, "changed" | "confirmed">,
  onStep?: (step: PermitActionStep) => void
): PermitActionHandle {
  let resolve!: () => void;
  let reject!: (error: unknown) => void;
  let isSettled = false;
  const done = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  const settle = (error?: unknown) => {
    if (isSettled) return;
    isSettled = true;
    if (error === undefined) resolve();
    else reject(error);
  };

  const signNext = async () => {
    try {
      onStep?.("preparing");
      await plan.review();
      if (plan.state !== "review" || !plan.prepared)
        throw plan.error ?? new Error("Unable to prepare the relay action.");

      // review() has just validated everything; the plan revalidates before
      // its POST, after the wallet prompt.
      onStep?.("signing");
      const signed = await signPreparedPermit(deps.runtime, plan.prepared);
      onStep?.("processing");
      await plan.submit(signed);
    } catch (error) {
      plan.stop();
      settle(error);
    }
  };

  const plan: OrderPlan = new OrderPlan(request, {
    ...deps,
    changed: () => {
      if (plan.state === "failed")
        settle(plan.error ?? new Error("Relay action failed."));
      // A confirmed operator setup needs the next signature for the action itself.
      else if (plan.state === "next") void signNext();
    },
    confirmed: () => settle(),
  });

  void signNext();

  return { plan, done };
}

/** Human-readable relay failure text; never the raw `Relay request failed: CODE`. */
export function getPermitActionErrorMessage(error: unknown) {
  const notice = getRelayFailureNotice(error);
  if (notice) return notice.message;
  if (error instanceof RelayApiError)
    return error.serverMessage ?? `Relay request failed (${error.code}).`;

  return error instanceof Error ? error.message : undefined;
}
