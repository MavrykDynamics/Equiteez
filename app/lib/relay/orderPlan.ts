import {
  buildPermitAction,
  readPermitOperator,
  type PermitRequest,
} from "~/contracts/orderbookPermit";
import {
  createReviewRuntime,
  preparePermit,
  type PermitRuntime,
  type PreparedPermit,
  type signPreparedPermit,
} from "~/contracts/permit";
import { fetchRelayCredits } from "~/lib/apis/rwa/relay/relay";
import { canResignRelay, RelayApiError } from "./relay.errors";
import { matchesRelayIntent } from "./relay.state";
import { CREDIT_SHORTAGE_MESSAGE } from "./relayFailure";
import type { RelayRecord } from "./relay.storage";

export { CREDIT_SHORTAGE_MESSAGE };

export type OrderPlanRequest = Exclude<
  PermitRequest,
  { kind: "fee_top_up" } | { kind: "update_operators" }
>;
export type SignedPermit = Awaited<ReturnType<typeof signPreparedPermit>>;
// A failed/rejected relay row: RelayProvider already toasts it once.
const relayOutcomes = new WeakSet<object>();
const markRelayOutcome = <T extends object>(error: T) => {
  relayOutcomes.add(error);
  return error;
};
export const isRelayOutcomeError = (error: unknown) =>
  typeof error === "object" && error !== null && relayOutcomes.has(error);

export type PlanState =
  | "idle"
  | "preparing"
  | "review"
  | "submitting"
  | "tracking"
  | "next"
  | "failed"
  | "confirmed";
type Dependencies = {
  runtime: PermitRuntime;
  /** `runtime` is the current review's (shared config and contracts). */
  validate: (
    request: OrderPlanRequest,
    runtime: PermitRuntime
  ) => Promise<void>;
  isLocked: (contract: string) => boolean;
  records: () => RelayRecord[];
  submit: (
    signed: SignedPermit,
    onAttempt: (id: string) => void
  ) => Promise<string>;
  changed: () => void;
  confirmed: () => void;
};

/** Local signature orchestration only. Durable attempts and retries belong to RelayProvider. */
export class OrderPlan {
  state: PlanState = "idle";
  prepared: PreparedPermit | null = null;
  error: unknown = null;
  canResign = false;
  private resigns = 0;
  private stopped = false;
  private scope: string;
  private attemptId?: string;
  private setupConfirmed = false;
  readonly request: OrderPlanRequest;
  constructor(
    request: OrderPlanRequest,
    private deps: Dependencies
  ) {
    this.request = JSON.parse(JSON.stringify(request));
    this.scope = JSON.stringify(deps.runtime.getScope());
  }
  private assertCurrent() {
    if (
      this.stopped ||
      JSON.stringify(this.deps.runtime.getScope()) !== this.scope
    )
      throw new Error(
        "Wallet or sign-in changed. Start a new review; submitted work remains tracked."
      );
  }
  private async checked<T>(task: Promise<T>): Promise<T> {
    const result = await task;
    this.assertCurrent();
    return result;
  }
  private set(state: PlanState) {
    this.state = state;
    this.deps.changed();
  }
  stop() {
    this.stopped = true;
    this.prepared = null;
  }
  private fail(error: unknown, conclusive = false) {
    if (this.stopped) return;
    this.error = error;
    this.prepared = null;
    this.canResign =
      error instanceof RelayApiError &&
      canResignRelay(error, this.resigns, conclusive);
    this.set("failed");
  }
  private assertUnlocked() {
    const request = this.request;
    const contracts =
      "book" in request
        ? [
            request.book.address,
            request.kind === "place_buy_order"
              ? request.book.quoteTokenAddress
              : request.book.baseTokenAddress,
          ]
        : [request.orderbookAddress];
    if (contracts.some(this.deps.isLocked))
      throw new Error(
        "An existing relay action must settle before this action. Use its recovery details."
      );
  }
  private async checkAllowance(
    request: PermitRequest,
    runtime: PermitRuntime = this.deps.runtime
  ) {
    const config = await this.checked(runtime.refreshConfig());
    const action = buildPermitAction(
      request,
      config,
      this.deps.runtime.getScope().wallet
    );
    if (!config.fee.enabled) return;
    const price = BigInt(config.fee.feeSchedule[action.variant] ?? "0");
    if (price === 0n) return; // Free actions never depend on a paid-credit read.
    const credits = await this.checked(
      fetchRelayCredits(this.deps.runtime.getScope().wallet, config)
    );
    if (!credits.enabled || credits.decimals !== config.fee.decimals)
      throw new Error(
        "Credit configuration changed. Refresh and review again."
      );
    // actionsRemaining already includes the free allowance; never add it again.
    const remaining =
      credits.actionsRemaining[action.variant] ??
      Number(BigInt(credits.balanceUnits) / price) +
        credits.freeAllowanceRemaining;
    if (remaining > 0) return;
    throw new RelayApiError(
      402,
      "FEE_CREDIT_REQUIRED",
      "give-up",
      undefined,
      0,
      undefined,
      CREDIT_SHORTAGE_MESSAGE
    );
  }
  private async operator(runtime: PermitRuntime = this.deps.runtime) {
    const request = this.request;
    if (!("book" in request)) return null;
    const isBuy = request.kind === "place_buy_order";
    return this.checked(
      readPermitOperator(
        runtime.tezos,
        isBuy ? request.book.quoteTokenAddress : request.book.baseTokenAddress,
        {
          owner: this.deps.runtime.getScope().wallet,
          operator: request.book.address,
          token_id: isBuy ? request.book.quoteTokenId : request.book.rwaTokenId,
        }
      )
    );
  }
  async review() {
    if (!["idle", "next", "failed"].includes(this.state)) return;
    if (this.state === "failed") {
      if (!this.canResign) return;
      this.resigns++;
    }
    this.canResign = false;
    this.error = null;
    this.set("preparing");
    try {
      this.assertCurrent();
      this.assertUnlocked();
      const runtime = createReviewRuntime(this.deps.runtime);
      // Independent reads; all settle before any setup signature is requested.
      const [, , operator] = await Promise.all([
        this.checked(this.deps.validate(this.request, runtime)),
        this.checkAllowance(this.request, runtime),
        this.operator(runtime),
      ]);
      let step: PermitRequest = this.request;
      if (operator?.needsGrant && "book" in this.request) {
        if (this.setupConfirmed)
          throw new Error(
            "Operator permission is still absent or unreadable after confirmation. Refresh before starting again."
          );
        step = {
          kind: "update_operators",
          book: this.request.book,
          side: this.request.kind === "place_buy_order" ? "buy" : "sell",
        };
        await this.checkAllowance(step, runtime);
      }
      this.prepared = await this.checked(preparePermit(runtime, step));
      this.assertUnlocked();
      this.set("review");
    } catch (error) {
      this.fail(error);
    }
  }
  /** Runs both before the wallet prompt and again before initial POST. */
  async validateReview() {
    this.assertCurrent();
    this.assertUnlocked();
    // Fresh config after the wallet prompt, read once for this pass.
    const runtime = createReviewRuntime(this.deps.runtime);
    const [, , operator] = await Promise.all([
      this.checked(this.deps.validate(this.request, runtime)),
      this.checkAllowance(this.request, runtime),
      this.prepared?.request.kind === "update_operators"
        ? null
        : this.operator(runtime),
    ]);
    if (operator?.needsGrant)
      throw new Error(
        "Operator permission changed. Close and review the action again."
      );
    if (this.prepared?.request.kind === "update_operators")
      await this.checkAllowance(this.prepared.request, runtime);
    this.assertUnlocked();
  }
  async submit(signed: SignedPermit) {
    if (this.state !== "review" || signed.prepared !== this.prepared) return;
    this.set("submitting");
    try {
      await this.validateReview();
      await this.checked(
        this.deps.submit(signed, (id) => {
          this.attemptId = id;
        })
      );
      this.prepared = null;
      this.set("tracking");
      this.reconcile();
    } catch (error) {
      if (this.stopped) return;
      const record = this.deps.records().find((r) => r.id === this.attemptId);
      if (record && record.state !== "settled") {
        this.error = error;
        this.prepared = null;
        this.set("tracking");
      } else this.fail(error, record?.state === "settled");
    }
  }
  reconcile() {
    if (this.state !== "tracking") return;
    try {
      this.assertCurrent();
      const record = this.deps.records().find((r) => r.id === this.attemptId);
      if (!record || record.state !== "settled") return;
      const row = record.row;
      if (
        !row?.updatedAt ||
        !record.intent ||
        row.contractAddress !== record.contract ||
        !matchesRelayIntent(record.intent, row)
      ) {
        this.fail(
          new Error(
            record.error ??
              "The attempt ended without confirmation of this action. Review recovery details."
          )
        );
        return;
      }
      if (row.status === "confirmed") {
        if (record.intent.kind === "update_operators") {
          this.setupConfirmed = true;
          this.set("next"); // Explicit next review; never a background wallet prompt.
        } else {
          this.set("confirmed");
          this.deps.confirmed();
        }
      } else if (row.status === "failed" || row.status === "rejected") {
        this.fail(
          markRelayOutcome(
            new RelayApiError(
              undefined,
              row.error?.code ?? "RELAY_FAILED",
              row.error?.remedy ?? "give-up",
              undefined,
              0,
              undefined,
              row.error?.message
            )
          ),
          true
        );
      }
    } catch (error) {
      this.fail(error);
    }
  }
}
