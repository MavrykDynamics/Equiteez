import { INTENTS_POLL_INTERVALS } from "~/consts/intents";
import { isIntentsApiError, type IntentsApi } from "~/lib/apis/intents";
import { sendIntentHint } from "~/lib/intents/intentHints";
import {
  isTerminalIntentStatus,
  type IntentRecord,
} from "~/lib/intents/intentOperation";
import type { IntentOperations } from "./intentOperations";

type Schedule = { nextAt: number; delay: number; version?: number };

/** Operations the user committed to whose backend state is still moving. */
export function isIntentTrackable(record: IntentRecord) {
  if (!record.operationId) return false;
  if (record.backend && isTerminalIntentStatus(record.backend.status))
    return false;
  if (
    record.fundingState === "abandoned" ||
    record.fundingState === "not_started" ||
    record.fundingState === "rejected"
  )
    // Still poll if the backend already saw funds for it.
    return Boolean(
      record.backend && record.backend.status !== "awaiting_deposit"
    );
  return true;
}

/**
 * Polls GET /operations/:id for open operations of one session with backoff
 * (5s rising to 30s, reset on progress), one request in flight per operation,
 * and retries failed deposit hints. The owner pauses it while the tab is
 * hidden. No socket of its own: NotificationsProvider stays the only socket.
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
    private readonly sendHint: typeof sendIntentHint = sendIntentHint
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
    return [...this.store.getSnapshot().records.values()].filter(
      isIntentTrackable
    );
  }

  private schedule() {
    if (!this.isRunning) return;
    clearTimeout(this.timer);
    const open = this.open();
    for (const record of open)
      if (!this.schedules.has(record.localId))
        this.schedules.set(record.localId, {
          nextAt: 0,
          delay: INTENTS_POLL_INTERVALS.initialMs,
        });
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
    const open = this.open();
    for (const record of open) {
      if (record.hintState === "failed" || record.hintState === "pending")
        void this.sendHint(this.api, this.store, record.localId);
      const schedule = this.schedules.get(record.localId) ?? {
        nextAt: 0,
        delay: INTENTS_POLL_INTERVALS.initialMs,
      };
      this.schedules.set(record.localId, schedule);
      if (schedule.nextAt > at || this.inFlight.has(record.localId)) continue;
      void this.poll(record, schedule);
    }
    this.schedule();
  }

  private async poll(record: IntentRecord, schedule: Schedule) {
    const signal = this.controller?.signal;
    this.inFlight.add(record.localId);
    try {
      const operation = await this.api.getOperation(record.operationId!, {
        signal,
      });
      if (signal?.aborted || !this.isCurrent()) return;
      this.store.applyBackend(record.localId, operation);
      const progressed = operation.version !== schedule.version;
      schedule.version = operation.version;
      schedule.delay = progressed
        ? INTENTS_POLL_INTERVALS.initialMs
        : Math.min(schedule.delay * 2, INTENTS_POLL_INTERVALS.maxMs);
    } catch (error) {
      if (signal?.aborted) return;
      schedule.delay =
        isIntentsApiError(error) && error.code === "not_found"
          ? INTENTS_POLL_INTERVALS.maxMs * 4
          : Math.min(schedule.delay * 2, INTENTS_POLL_INTERVALS.maxMs);
    } finally {
      this.inFlight.delete(record.localId);
      schedule.nextAt = this.now() + schedule.delay;
      this.schedule();
    }
  }
}
