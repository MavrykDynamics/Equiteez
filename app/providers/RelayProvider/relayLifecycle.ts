import type { QueryClient } from "@tanstack/react-query";
import { v4 as uuid } from "uuid";
import { z } from "zod";
import * as api from "~/lib/apis/rwa/relay/relay";
import type {
  RelayConfig,
  RelayOperation,
  RelaySubmitRequest,
  RelayTopUpRequest,
} from "~/lib/apis/rwa/relay/relay.types";
import {
  RelayApiError,
  getRelayErrorAction,
  getRelayRetryDelay,
  toRelayApiError,
} from "~/lib/relay/relay.errors";
import {
  hasRelayLock,
  readRelayRecords,
  writeRelayRecord,
  type RelayRecord,
  type RelayStorage,
} from "~/lib/relay/relay.storage";
import {
  isRelayTerminal,
  matchesRelayIntent,
  mergeRelayRow,
  relayEventSchema,
  relayIntentIdentity,
  relayPollInterval,
  relayRowKey,
  type RelayRow,
} from "~/lib/relay/relay.state";

type Dependencies = {
  scope: string;
  wallet: string;
  storage: RelayStorage;
  queryClient: QueryClient;
  isCurrent: () => boolean;
  changed: () => void;
  outcome: (row: RelayRow, previous?: RelayRow) => void;
  notify: (row: RelayRow) => void;
  api?: Pick<
    typeof api,
    | "submitRelayOperation"
    | "submitRelayTopUp"
    | "fetchRelayOperation"
    | "checkRelayOperationNow"
    | "fetchRelayOperations"
  >;
};
// Tolerates client/server clock differences when matching or expiring top-ups.
const TOP_UP_CLOCK_SKEW = 120_000;
export class RelayLifecycle {
  records: RelayRecord[] = [];
  error: string | null = null;
  isReconciled = false;
  private stopped = false;
  private storageHealthy = true;
  private controller = new AbortController();
  private timer: ReturnType<typeof setTimeout> | undefined;
  private timerRevision = 0;
  private notifier = false;
  private events = new Set<string>();
  private busy = new Set<string>();
  private reconciliation: Promise<void> | undefined;
  private api: NonNullable<Dependencies["api"]>;
  constructor(private dependencies: Dependencies) {
    this.api = dependencies.api ?? api;
  }
  private current() {
    return !this.stopped && this.dependencies.isCurrent();
  }
  private assertCurrent() {
    if (!this.current())
      throw new Error(
        "Relay scope changed. Recover this action in its original account and network."
      );
  }
  private changed() {
    if (this.current()) this.dependencies.changed();
  }
  private failure(error: unknown) {
    if (!this.current()) return;
    this.error =
      error instanceof Error ? error.message : "Relay recovery failed";
    this.changed();
  }
  restore() {
    this.assertCurrent();
    try {
      const stored = readRelayRecords(
        this.dependencies.storage,
        this.dependencies.scope
      );
      // Never discard an in-memory unknown marker when another tab clears storage.
      for (const record of stored) {
        const local = this.records.find((r) => r.id === record.id);
        const merged =
          local?.row && record.row
            ? mergeRelayRow(local.row, record.row)
            : record.row;
        this.records = [
          ...this.records.filter((r) => r.id !== record.id),
          { ...record, row: merged },
        ];
        if (merged)
          this.dependencies.queryClient.setQueryData(
            relayRowKey(record.scope, merged.operationId),
            merged
          );
      }
      this.error = null;
      this.storageHealthy = true;
    } catch (error) {
      this.storageHealthy = false;
      this.failure(error);
    }
    this.changed();
  }
  start() {
    this.restore();
    for (const record of this.records) {
      if (record.row?.updatedAt && isRelayTerminal(record.row.status)) {
        try {
          this.accept(record.row);
        } catch (error) {
          this.failure(error);
        }
      }
    }
    void this.reconcile();
    this.schedule();
  }
  stop() {
    this.stopped = true;
    this.timerRevision += 1;
    this.controller.abort();
    clearTimeout(this.timer);
  }
  setNotifier(authenticated: boolean) {
    if (authenticated === this.notifier) return;
    this.notifier = authenticated;
    if (authenticated) void this.reconcile();
    clearTimeout(this.timer);
    this.schedule();
  }
  private schedule() {
    if (!this.current()) return;
    const timerRevision = ++this.timerRevision;
    this.timer = setTimeout(async () => {
      const ids = [
        ...new Set(
          this.records
            .filter(
              (r) =>
                r.operationId &&
                (!r.row?.updatedAt || !isRelayTerminal(r.row.status))
            )
            .map((r) => r.operationId!)
        ),
      ];
      await Promise.all(ids.map((id) => this.refresh(id)));
      await this.retryUnknown();
      if (
        !this.isReconciled ||
        this.records.some((r) => !r.operationId && r.state !== "settled")
      )
        await this.reconcile();
      this.changed();
      if (timerRevision === this.timerRevision) this.schedule();
    }, relayPollInterval(this.notifier));
  }
  // Bounded replays of the exact payload and idempotency key; the key makes
  // a replay of an already admitted operation return its stored ids.
  private async retryUnknown() {
    const due = this.records.filter(
      (r) =>
        r.payload &&
        !r.operationId &&
        r.state === "unknown" &&
        r.remedy !== "sign-in" &&
        r.posts < 4 &&
        Date.now() >= r.nextRetryAt
    );
    for (const record of due) {
      if (!this.current()) return;
      await this.retry(record.id).catch(() => undefined);
    }
  }
  private save(record: RelayRecord) {
    this.assertCurrent();
    // Retain locks in memory even if storage fails after POST.
    this.records = [...this.records.filter((r) => r.id !== record.id), record];
    try {
      writeRelayRecord(this.dependencies.storage, record);
    } catch (error) {
      this.storageHealthy = false;
      this.failure(
        new Error(
          "Relay recovery could not be saved. Keep this page open and restore browser storage."
        )
      );
      throw error;
    }
    this.changed();
  }
  locked(contract: string) {
    return (
      !this.storageHealthy ||
      Boolean(this.error) ||
      !this.isReconciled ||
      hasRelayLock(this.records, contract)
    );
  }
  row(id: string) {
    return this.dependencies.queryClient.getQueryData<RelayRow>(
      relayRowKey(this.dependencies.scope, id)
    );
  }
  private accept(row: RelayRow) {
    this.assertCurrent();
    const matchingRecords = this.records.filter(
      (record) => record.operationId === row.operationId
    );
    for (const record of matchingRecords) {
      if (
        (row.contractAddress && row.contractAddress !== record.contract) ||
        (record.intent && row.intent && !matchesRelayIntent(record.intent, row))
      ) {
        throw new Error(
          "Relay operation does not match the saved action. Keep the action locked and reconcile it."
        );
      }
    }
    const previous = this.row(row.operationId);
    const merged = mergeRelayRow(previous, row);
    this.dependencies.queryClient.setQueryData(
      relayRowKey(this.dependencies.scope, row.operationId),
      merged
    );
    let records = this.records.filter((r) => r.operationId === row.operationId);
    if (!records.length) {
      if (!merged.contractAddress || !merged.createdAt)
        throw new Error("Relay operation metadata is incomplete");
      records = [
        {
          version: 1,
          scope: this.dependencies.scope,
          id: row.operationId,
          operationId: row.operationId,
          contract: merged.contractAddress,
          createdAt: Date.parse(merged.createdAt),
          method: "credits",
          identity: "external",
          state: "tracking",
          posts: 0,
          nextRetryAt: 0,
          minimized: true,
          dismissed: false,
        },
      ];
    }
    const terminal = Boolean(
      merged.updatedAt && isRelayTerminal(merged.status)
    );
    for (const record of records)
      this.save({
        ...record,
        row: merged,
        state: terminal ? "settled" : "tracking",
        payload: terminal ? undefined : record.payload,
        settledObservedAt: terminal
          ? (record.settledObservedAt ?? Date.now())
          : undefined,
      });
    if (
      terminal &&
      (!previous?.updatedAt ||
        previous.status !== merged.status ||
        previous.feeChargedUnits !== merged.feeChargedUnits)
    )
      this.dependencies.outcome(merged, previous);
    if (terminal) {
      // Write before toast. Storage denial suppresses the toast rather than
      // claiming once-only delivery without a durable marker.
      const key = `relay-notified:${this.dependencies.scope}:${row.operationId}`;
      if (!this.dependencies.storage.getItem(key)) {
        this.dependencies.storage.setItem(key, "1");
        this.dependencies.notify(merged);
      }
    }
    this.changed();
    return merged;
  }
  async refresh(id: string, fresh = false) {
    if (!this.current() || this.busy.has(id)) return;
    this.busy.add(id);
    try {
      const result = await (
        fresh ? this.api.checkRelayOperationNow : this.api.fetchRelayOperation
      )(this.dependencies.wallet, id, this.controller.signal);
      this.assertCurrent();
      this.accept(result.operation);
      if (this.storageHealthy) this.error = null;
      this.changed();
    } catch (error) {
      this.failure(error);
    } finally {
      this.busy.delete(id);
    }
  }
  reconcile() {
    if (this.reconciliation) return this.reconciliation;
    this.reconciliation = this.reconcilePages().finally(() => {
      this.reconciliation = undefined;
    });
    return this.reconciliation;
  }
  private async reconcilePages() {
    if (!this.current()) return;
    try {
      // Unknown submissions may already be terminal. Never infer absence from
      // an empty open list, nor adopt historical intent matches as our attempt.
      const uncertain = this.records.some(
        (r) => !r.operationId && r.state !== "settled"
      );
      const seen = new Set<string>();
      const topUps: RelayOperation[] = [];
      let cursor: string | undefined;
      do {
        const page = await this.api.fetchRelayOperations(
          this.dependencies.wallet,
          { status: uncertain ? undefined : ["open"], limit: 100, cursor },
          this.controller.signal
        );
        this.assertCurrent();
        for (const row of page.items) {
          if (row.intentKind === "fee_top_up") topUps.push(row);
          if (
            !isRelayTerminal(row.status) ||
            this.records.some((r) => r.operationId === row.operationId)
          )
            this.accept(row);
        }
        cursor = page.nextCursor ?? undefined;
        if (cursor && seen.has(cursor))
          throw new Error(
            "Relay history cursor repeated. Recovery is incomplete."
          );
        if (cursor) seen.add(cursor);
      } while (cursor);
      if (uncertain) this.resolveTopUps(topUps);
      this.isReconciled = true;
      if (this.storageHealthy) this.error = null;
      this.changed();
    } catch (error) {
      this.failure(error);
    }
  }
  /**
   * Matches top-ups whose POST outcome is unknown against a complete history
   * list. Without a match the attempt is released only when the API answered
   * the POST or the signed deadline has passed, so it can no longer execute.
   */
  private resolveTopUps(rows: RelayOperation[]) {
    for (const record of this.records) {
      if (!record.topUp || record.operationId || record.state === "settled")
        continue;
      const { amountUnits, deadline, answered } = record.topUp;
      const candidates = rows.filter(
        (row) =>
          row.contractAddress === record.contract &&
          Date.parse(row.createdAt) >= record.createdAt - TOP_UP_CLOCK_SKEW &&
          (row.intent.amountUnits === undefined ||
            String(row.intent.amountUnits) === amountUnits) &&
          !this.records.some((r) => r.operationId === row.operationId)
      );
      if (candidates.length === 1) {
        this.save({
          ...record,
          operationId: candidates[0].operationId,
          state: "tracking",
          error: undefined,
        });
        this.accept(candidates[0]);
      } else if (
        !candidates.length &&
        (answered || Date.now() > Date.parse(deadline) + TOP_UP_CLOCK_SKEW)
      ) {
        this.save({
          ...record,
          state: "settled",
          error: "The top-up was not received. No payment was made.",
        });
      }
    }
  }
  /**
   * The top-up route has no idempotency key: one POST, never replayed. The
   * attempt is saved first and locks the fee token until its outcome is known.
   */
  async submitTopUp(
    payload: RelayTopUpRequest,
    config: RelayConfig,
    validate: () => Promise<void>
  ) {
    if (!config.enabled || !config.fee.enabled)
      throw new RelayApiError(undefined, "FEE_DISABLED", "give-up");
    const contract = config.fee.tokenContract;
    this.assertCurrent();
    this.restore();
    if (this.locked(contract))
      throw new Error(
        "Relay recovery must finish before another action on this token."
      );
    await validate();
    this.assertCurrent();
    this.restore();
    if (this.locked(contract))
      throw new Error("Another relay action occupies this token.");
    const record: RelayRecord = {
      version: 1,
      scope: this.dependencies.scope,
      id: uuid(),
      contract,
      identity: `fee_top_up:${payload.amountUnits}:${payload.deadline}`,
      topUp: {
        amountUnits: payload.amountUnits,
        deadline: payload.deadline,
        answered: false,
      },
      createdAt: Date.now(),
      method: "credits",
      state: "unknown",
      posts: 1,
      nextRetryAt: 0,
      minimized: false,
      dismissed: false,
    };
    this.save(record); // MUST succeed before the POST.
    try {
      const accepted = await this.api.submitRelayTopUp(
        this.dependencies.wallet,
        payload,
        config,
        this.controller.signal
      );
      this.assertCurrent();
      this.save({
        ...record,
        operationId: accepted.operationId,
        state: "tracking",
      });
      // The 202 has no status; the full row comes from the GET below.
      this.accept({
        operationId: accepted.operationId,
        gasStationOperationId: accepted.gasStationOperationId,
        status: "pending",
        intentKind: "fee_top_up",
        contractAddress: contract,
      });
      await this.refresh(accepted.operationId);
      return accepted.operationId;
    } catch (raw) {
      this.assertCurrent();
      // Accepted already: tracking owns the outcome from here.
      if (this.records.find((r) => r.id === record.id)?.operationId) throw raw;
      const error = toRelayApiError(raw);
      const message = error.serverMessage ?? error.message;
      if (error.status && error.status < 500) {
        // Refused before persistence. An in-flight conflict names another
        // operation (possibly an operator grant): track it, never adopt it.
        if (error.code === "PERMIT_IN_FLIGHT") {
          const detail = z
            .object({ operationId: z.string().uuid() })
            .safeParse(error.detail);
          if (detail.success) void this.refresh(detail.data.operationId);
        }
        this.save({
          ...record,
          state: "settled",
          error: message,
          remedy: getRelayErrorAction(error),
        });
      } else {
        this.save({
          ...record,
          topUp: { ...record.topUp!, answered: error.status !== undefined },
          error: message,
          remedy: getRelayErrorAction(error),
        });
        void this.reconcile();
      }
      throw error;
    }
  }
  event(eventId: string, wallet: string, payload: unknown) {
    if (
      !this.current() ||
      wallet !== this.dependencies.wallet ||
      this.events.has(eventId)
    )
      return;
    const parsed = relayEventSchema.safeParse(payload);
    if (
      !parsed.success ||
      parsed.data.walletAddress !== wallet ||
      !this.row(parsed.data.operationId)
    )
      return;
    const { error, ...row } = parsed.data;
    this.events.add(eventId);
    if (this.events.size > 500)
      this.events.delete(this.events.values().next().value!);
    const previous = this.row(row.operationId);
    const normalizedError =
      error === undefined
        ? undefined
        : error === null
          ? null
          : {
              ...error,
              message: error.message ?? previous?.error?.message ?? error.code,
            };
    try {
      this.accept({
        ...row,
        ...(normalizedError === undefined ? {} : { error: normalizedError }),
      });
    } catch (failure) {
      this.failure(failure);
    }
  }
  async submit(payload: RelaySubmitRequest, validate: () => Promise<void>) {
    this.assertCurrent();
    this.restore();
    if (this.locked(payload.operation.to))
      throw new Error(
        "Relay recovery must finish before another action on this contract."
      );
    await validate();
    this.assertCurrent();
    this.restore();
    if (this.locked(payload.operation.to))
      throw new Error("Another relay action occupies this contract.");
    const id = payload.idempotencyKey;
    if (!id) throw new Error("A durable idempotency key is required");
    if (this.records.some((r) => r.id === id))
      throw new Error(
        "This key already belongs to a relay attempt. Use recovery."
      );
    const record: RelayRecord = {
      version: 1,
      scope: this.dependencies.scope,
      id,
      contract: payload.operation.to,
      intent: payload.intent,
      identity: relayIntentIdentity(payload.intent),
      payload: JSON.parse(JSON.stringify(payload)),
      createdAt: Date.now(),
      method: "credits",
      state: "unknown",
      posts: 0,
      nextRetryAt: 0,
      minimized: false,
      dismissed: false,
    };
    this.save(record); // MUST succeed before the first POST.
    return this.post(record);
  }
  async retry(id: string) {
    this.assertCurrent();
    this.restore();
    const record = this.records.find((r) => r.id === id);
    if (
      !this.storageHealthy ||
      !record?.payload ||
      record.operationId ||
      record.posts >= 4 ||
      record.state === "settled" ||
      record.state === "blocked" ||
      Date.now() < record.nextRetryAt
    )
      throw new Error(
        "This attempt cannot be retried. Reconcile its existing outcome."
      );
    return this.post(record);
  }
  private async post(record: RelayRecord) {
    if (this.busy.has(record.id))
      throw new Error("This attempt is already being submitted");
    this.busy.add(record.id);
    const attempt = { ...record, posts: record.posts + 1 };
    try {
      this.save(attempt);
      const accepted = await this.api.submitRelayOperation(
        this.dependencies.wallet,
        attempt.payload!,
        this.controller.signal
      );
      this.assertCurrent();
      // Even a terminal replay acceptance needs an authoritative GET before
      // settling the lock or emitting a completion notification.
      this.save({
        ...attempt,
        operationId: accepted.operationId,
        state: "tracking",
      });
      this.accept({
        ...accepted,
        intent: attempt.intent,
        intentKind: attempt.intent!.kind,
        contractAddress: attempt.contract,
      });
      await this.refresh(accepted.operationId);
      return accepted.operationId;
    } catch (raw) {
      this.assertCurrent();
      const error = toRelayApiError(raw);
      if (error.status === 409 && error.code === "PERMIT_IN_FLIGHT") {
        const detail = z
          .object({ operationId: z.string().uuid() })
          .safeParse(error.detail);
        if (detail.success) {
          try {
            const { operation } = await this.api.fetchRelayOperation(
              this.dependencies.wallet,
              detail.data.operationId,
              this.controller.signal
            );
            this.assertCurrent();
            if (operation.contractAddress !== attempt.contract)
              throw new Error("Conflicting relay contract mismatch");
            if (matchesRelayIntent(attempt.intent!, operation)) {
              this.save({
                ...attempt,
                operationId: operation.operationId,
                state: "tracking",
              });
              this.accept(operation);
              return operation.operationId;
            }
            this.accept(operation);
            // A first, conclusively rejected request did not submit this intent.
            // A prior uncertain POST still needs exact-key reconciliation.
            if (attempt.posts === 1)
              this.save({
                ...attempt,
                state: "settled",
                payload: undefined,
                error:
                  "Another action occupies this contract. Its confirmation does not complete your requested action.",
              });
          } catch (failure) {
            this.failure(failure);
          }
        }
      }
      const current = this.records.find((r) => r.id === attempt.id)!;
      if (!current.operationId && current.state !== "settled") {
        if (
          attempt.posts === 1 &&
          error.status &&
          [400, 402, 403, 404, 422].includes(error.status)
        ) {
          this.save({
            ...current,
            state: "settled",
            payload: undefined,
            error: error.serverMessage ?? error.message,
            remedy: getRelayErrorAction(error),
          });
          throw error;
        }
        const retryError =
          error.status === undefined
            ? new RelayApiError(undefined, error.code, "retry")
            : error;
        const delay = getRelayRetryDelay(retryError, attempt.posts - 1);
        this.save({
          ...current,
          state: delay === null && error.status !== 401 ? "blocked" : "unknown",
          nextRetryAt: Date.now() + (delay ?? 0),
          error: error.serverMessage ?? error.message,
          remedy: getRelayErrorAction(error),
        });
      }
      throw error;
    } finally {
      this.busy.delete(record.id);
    }
  }
  present(id: string, minimized: boolean, dismissed = false) {
    const record = this.records.find((r) => r.id === id);
    if (!record || (dismissed && record.state !== "settled")) return;
    try {
      this.save({ ...record, minimized, dismissed });
    } catch (error) {
      this.failure(error);
    }
  }
}
