import {
  INTENTS_NOT_FOUND_LIMIT,
  INTENTS_POLL_INTERVALS,
  INTENTS_UNTRACKED_SETTLEMENT_POLL_MS,
} from "~/consts/intents";
import { isIntentsApiError, type IntentsApi } from "~/lib/apis/intents";
import {
  hasIntentFundsObserved,
  isIntentClosed,
  type IntentRecord,
} from "~/lib/intents/intentOperation";
import type { IntentOperations } from "./intentOperations";

type Schedule = { nextAt: number; errorDelay: number };

/**
 * Operations whose backend state is still worth reading. Unfunded operations
 * are polled only while the modal can still use their instructions; an
 * operation the modal dropped is polled only if the backend saw funds.
 */
export function isIntentTrackable(record: IntentRecord, now = Date.now()) {
  if (!record.operationId || isIntentClosed(record)) return false;
  const backend = record.backend;
  if (record.fundingState === "abandoned")
    return hasIntentFundsObserved(backend);
  if (
    backend?.phase === "WRAPPED" &&
    backend.settlement.status === "NOT_TRACKED"
  )
    // Settlement observation is optional; stop once it is clearly not coming.
    return (
      Date.parse(backend.updatedAt) + INTENTS_UNTRACKED_SETTLEMENT_POLL_MS > now
    );
  return true;
}

const jitter = (ms: number) => Math.round(ms * (0.9 + Math.random() * 0.2));
const clamp = (ms: number) =>
  Math.min(
    INTENTS_POLL_INTERVALS.maxMs,
    Math.max(INTENTS_POLL_INTERVALS.minMs, ms)
  );

/**
 * Polls `GET /v1/operations/:id` (read-only: never signs, sends or requotes)
 * for open operations of one session. The interval follows the operation's
 * `retryAfterMs` with jitter; errors back off exponentially, and 429/503
 * honour `Retry-After`. One request in flight per operation. The owner
 * pauses it while the tab is hidden. There is no webhook/WebSocket in this
 * backend release and NotificationsProvider stays the only socket.
 */
export class IntentOperationsTracker {
  private schedules = new Map<string, Schedule>();
  private inFlight = new Set<string>();
  private timer?: ReturnType<typeof setTimeout>;
  private controller?: AbortController;
  private unsubscribe?: () => void;
  private isRunning = false;

  constructor(
    private readonly store: IntentOperations,
    private readonly api: IntentsApi,
    private readonly isCurrent: () => boolean,
    private readonly now: () => number = Date.now,
    private readonly random: (ms: number) => number = jitter
  ) {}

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.controller = new AbortController();
    this.store.restore();
    // New or resumed operations are polled straight away.
    this.unsubscribe = this.store.subscribe(() => this.schedule());
    for (const schedule of this.schedules.values()) schedule.nextAt = 0;
    void this.tick();
  }

  stop() {
    this.isRunning = false;
    clearTimeout(this.timer);
    this.timer = undefined;
    this.controller?.abort();
    this.controller = undefined;
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    this.inFlight.clear();
  }

  /** Poll now, e.g. after the modal reopens an operation. */
  refresh(localId?: string) {
    for (const [id, schedule] of this.schedules)
      if (!localId || id === localId) schedule.nextAt = 0;
    if (this.isRunning) void this.tick();
  }

  private open() {
    const at = this.now();
    return [...this.store.getSnapshot().records.values()].filter((record) =>
      isIntentTrackable(record, at)
    );
  }

  private newSchedule(): Schedule {
    return { nextAt: 0, errorDelay: INTENTS_POLL_INTERVALS.errorInitialMs };
  }

  private schedule() {
    if (!this.isRunning) return;
    clearTimeout(this.timer);
    const open = this.open();
    for (const record of open)
      if (!this.schedules.has(record.localId))
        this.schedules.set(record.localId, this.newSchedule());
    const ids = new Set(open.map((record) => record.localId));
    for (const id of this.schedules.keys())
      if (!ids.has(id)) this.schedules.delete(id);
    const next = Math.min(
      ...[...this.schedules.values()].map((item) => item.nextAt)
    );
    if (Number.isFinite(next))
      this.timer = setTimeout(
        () => void this.tick(),
        Math.max(0, next - this.now())
      );
  }

  private async tick() {
    if (!this.isRunning || !this.isCurrent()) return;
    const at = this.now();
    for (const record of this.open()) {
      const schedule = this.schedules.get(record.localId) ?? this.newSchedule();
      this.schedules.set(record.localId, schedule);
      if (schedule.nextAt > at || this.inFlight.has(record.localId)) continue;
      void this.poll(record, schedule);
    }
    this.schedule();
  }

  private async poll(record: IntentRecord, schedule: Schedule) {
    const signal = this.controller?.signal;
    this.inFlight.add(record.localId);
    let delay: number = INTENTS_POLL_INTERVALS.defaultMs;
    try {
      const operation = await this.api.getOperation(
        record.capability,
        record.operationId!,
        { signal }
      );
      if (signal?.aborted || !this.isCurrent()) return;
      this.store.applyBackend(record.localId, operation);
      schedule.errorDelay = INTENTS_POLL_INTERVALS.errorInitialMs;
      delay = this.random(clamp(operation.retryAfterMs || delay));
    } catch (error) {
      if (signal?.aborted || !this.isCurrent()) return;
      const apiError = isIntentsApiError(error) ? error : undefined;
      if (
        apiError?.code === "NOT_FOUND" ||
        apiError?.code === "OPERATION_NOT_FOUND"
      ) {
        // Missing/invalid capability or a reset backend. Keep the record for
        // support; stop after a few confirmations.
        const count = (this.store.get(record.localId)?.notFoundCount ?? 0) + 1;
        this.store.patch(
          record.localId,
          count >= INTENTS_NOT_FOUND_LIMIT
            ? { notFoundCount: count, access: "lost" }
            : { notFoundCount: count }
        );
      }
      delay = this.random(clamp(apiError?.retryAfterMs ?? schedule.errorDelay));
      schedule.errorDelay = Math.min(
        schedule.errorDelay * 2,
        INTENTS_POLL_INTERVALS.maxMs
      );
    } finally {
      this.inFlight.delete(record.localId);
      schedule.nextAt = this.now() + delay;
      this.schedule();
    }
  }
}
