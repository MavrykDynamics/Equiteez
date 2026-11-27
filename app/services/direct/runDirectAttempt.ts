/**
 * Runs one direct (MVRK-paid) submission as a tracked attempt
 * (docs/dynamic-wallet.md §8.7–§8.8, DYN-FE-10):
 *
 * 1. Logical-action lock without waiting: a double click or a second tab
 *    gets ActionInProgressError instead of a second submission.
 * 2. An unresolved attempt with the same intent blocks a new one.
 * 3. Manager-operation lock per source, held until the caller has the
 *    receipt: taquito reads the counter from the chain head, so a second
 *    operation sent while the first is pending would reuse its counter.
 * 4. The attempt is recorded before signing; the guarded injector records
 *    the hash before broadcast.
 */
import {
  UNRESOLVED_PHASES,
  type AttemptIdentity,
  type DirectAttempt,
  type RejectReason,
} from "./attempt.types";
import type { AttemptStore } from "./attemptStore";
import { describeError, type ActiveAttemptSlot } from "./guardedInjector";
import { lockNames, withLock, withLockIfAvailable } from "./locks";

/** A previous submission of this intent may still execute. */
export class UnresolvedAttemptError extends Error {
  constructor(public readonly attempt: DirectAttempt) {
    super(
      "A previous transaction for this action is still processing. Wait for it to finish before trying again."
    );
    this.name = "UnresolvedAttemptError";
  }
}

const PREAPPLY_ERROR_NAMES = new Set([
  "MavrykPreapplyFailureError",
  "MavrykOperationError",
]);

export type AttemptOutcome = "applied" | "failed" | "unknown";

export type AttemptContext = {
  attempt: DirectAttempt;
  /** Record the result read from the operation's receipt */
  resolve: (outcome: AttemptOutcome, error?: string) => DirectAttempt;
};

type RunDirectAttemptParams<T> = {
  identity: AttemptIdentity;
  /** e.g. "orderbook.buy" */
  action: string;
  intentFingerprint: string;
  store: AttemptStore;
  slot: ActiveAttemptSlot;
  /** Signs, sends and waits for the receipt; calls ctx.resolve() */
  execute: (context: AttemptContext) => Promise<T>;
  /** Provider-specific: did the user decline in the wallet? */
  isUserRejection?: (error: unknown) => boolean;
  createId?: () => string;
};

function rejectReasonFor(
  error: unknown,
  isUserRejection?: (error: unknown) => boolean
): RejectReason {
  if (isUserRejection?.(error)) return "user";
  if (error instanceof Error && PREAPPLY_ERROR_NAMES.has(error.name)) {
    return "preapply";
  }
  return "error";
}

export function findUnresolvedAttempt(
  store: AttemptStore,
  identity: AttemptIdentity,
  intentFingerprint: string
) {
  return (
    store
      .list(identity)
      .find(
        (attempt) =>
          attempt.intentFingerprint === intentFingerprint &&
          UNRESOLVED_PHASES.has(attempt.phase)
      ) ?? null
  );
}

export function runDirectAttempt<T>({
  identity,
  action,
  intentFingerprint,
  store,
  slot,
  execute,
  isUserRejection,
  createId = () => globalThis.crypto.randomUUID(),
}: RunDirectAttemptParams<T>): Promise<{ attempt: DirectAttempt; result: T }> {
  return withLockIfAvailable(
    lockNames.logicalAction(identity, intentFingerprint),
    () => {
      const unresolved = findUnresolvedAttempt(
        store,
        identity,
        intentFingerprint
      );

      if (unresolved) throw new UnresolvedAttemptError(unresolved);

      return withLock(lockNames.managerOperation(identity), async () => {
        const created = store.create({
          attemptId: createId(),
          action,
          intentFingerprint,
          identity,
          phase: "prepared",
        });
        const { attemptId } = created;

        const resolve = (outcome: AttemptOutcome, error?: string) =>
          store.update(attemptId, { phase: outcome, error });

        slot.current = created;

        try {
          const result = await execute({ attempt: created, resolve });
          const attempt = store.get(attemptId) ?? created;

          // Sent but the caller never read a receipt: do not call it done
          if (
            attempt.phase === "broadcasting" ||
            attempt.phase === "injected"
          ) {
            return { attempt: resolve("unknown"), result };
          }

          return { attempt, result };
        } catch (error) {
          const attempt = store.get(attemptId);

          if (attempt?.phase === "prepared") {
            store.update(attemptId, {
              phase: "rejected",
              rejectReason: rejectReasonFor(error, isUserRejection),
              error: describeError(error),
            });
          } else if (attempt?.phase === "injected") {
            // e.g. confirmation timed out: it may still be included
            resolve("unknown", describeError(error));
          }

          throw error;
        } finally {
          if (slot.current?.attemptId === attemptId) slot.current = null;
        }
      });
    }
  );
}
