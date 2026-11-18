/**
 * Resolves direct attempts from operation receipts after a reload, a lost
 * response or a return to the account (docs/dynamic-wallet.md §9.2).
 *
 * Only a receipt resolves an attempt that may have been broadcast. Not
 * finding the hash keeps it unresolved: an empty indexer answer, a stale
 * branch or a changed counter is not proof the operation never executed.
 */
import {
  UNRESOLVED_PHASES,
  type AttemptScope,
  type DirectAttempt,
} from "./attempt.types";
import type { AttemptStore } from "./attemptStore";
import { describeError } from "./guardedInjector";
import { isLockFree, lockNames } from "./locks";

type ReceiptEntry = { status?: string };

export type ReceiptOutcome = "not-found" | "applied" | "failed";

/**
 * An operation succeeded only if every manager content and every internal
 * operation under its hash was applied. Indexers list internal operations as
 * separate entries with the same hash.
 */
export function inspectReceipt(
  entries: readonly ReceiptEntry[]
): ReceiptOutcome {
  if (entries.length === 0) return "not-found";

  return entries.every((entry) => entry.status === "applied")
    ? "applied"
    : "failed";
}

type ReconcileParams = {
  scope: AttemptScope;
  store: AttemptStore;
  fetchOperationsByHash: (
    chainId: string,
    opHash: string
  ) => Promise<readonly ReceiptEntry[]>;
  isLockFree?: (name: string) => Promise<boolean>;
};

/** Returns the scope's attempts after reconciliation. */
export async function reconcileAttempts({
  scope,
  store,
  fetchOperationsByHash,
  isLockFree: lockFree = isLockFree,
}: ReconcileParams): Promise<DirectAttempt[]> {
  store.prune();

  for (const attempt of store.list(scope)) {
    if (attempt.phase === "prepared") {
      // "broadcasting" is written before any network call, so a prepared
      // attempt that no tab is working on never reached the network
      const name = lockNames.logicalAction(
        attempt.identity,
        attempt.intentFingerprint
      );

      if (await lockFree(name)) {
        store.update(attempt.attemptId, {
          phase: "rejected",
          rejectReason: "abandoned",
        });
      }
      continue;
    }

    if (!UNRESOLVED_PHASES.has(attempt.phase) || !attempt.ref) continue;

    try {
      const entries = await fetchOperationsByHash(
        attempt.identity.chainId,
        attempt.ref.opHash
      );
      const outcome = inspectReceipt(entries);

      if (outcome !== "not-found") {
        store.update(attempt.attemptId, { phase: outcome });
      }
    } catch (error) {
      // Indexer unavailable: try again later, keep the attempt unresolved
      store.update(attempt.attemptId, { error: describeError(error) });
    }
  }

  return store.list(scope);
}

/**
 * Sends the exact same signed bytes again (same hash) for an unknown
 * attempt, if this tab still has them. Never signs a replacement.
 */
export async function rebroadcastAttempt({
  attemptId,
  store,
  injectOperation,
}: {
  attemptId: string;
  store: AttemptStore;
  injectOperation: (signedBytes: string) => Promise<string>;
}): Promise<boolean> {
  const attempt = store.get(attemptId);
  const signedBytes = store.getRetryBytes(attemptId);

  if (attempt?.phase !== "unknown" || !attempt.ref || !signedBytes) {
    return false;
  }

  try {
    const returnedHash = await injectOperation(signedBytes);

    if (returnedHash === attempt.ref.opHash) {
      store.update(attemptId, { phase: "injected" });
      return true;
    }
  } catch (error) {
    // e.g. already included or branch too old: only a receipt can tell
    store.update(attemptId, { error: describeError(error) });
  }

  return false;
}
