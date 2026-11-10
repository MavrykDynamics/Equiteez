/**
 * Runs a contract action as a tracked direct attempt (DYN-FE-09/10).
 *
 * Dynamic toolkits broadcast through the guarded injector, which records the
 * hash before the RPC call. Extension wallets (WE/Beacon) broadcast
 * themselves, so their hash is recorded as soon as the wallet returns it;
 * both get the same locks and duplicate protection.
 */
import type { AttemptIdentity } from "./attempt.types";
import type { AttemptStore } from "./attemptStore";
import { fingerprintIntent, normalizeIntent } from "./fingerprint";
import type { ActiveAttemptSlot } from "./guardedInjector";
import { OperationFailedOnChainError } from "./operationResults";
import { runDirectAttempt } from "./runDirectAttempt";

export type AttemptTracking = {
  identity: AttemptIdentity;
  store: AttemptStore;
  slot: ActiveAttemptSlot;
  isUserRejection?: (error: unknown) => boolean;
};

export type AttemptHooks = {
  /** The wallet or node returned the operation hash */
  onSubmitted: (opHash: string) => void;
  /** Every result of the included operation was applied */
  onApplied: () => void;
};

const NO_HOOKS: AttemptHooks = {
  onSubmitted: () => undefined,
  onApplied: () => undefined,
};

export function intentFingerprintFor(action: string, intent: unknown) {
  return fingerprintIntent({ action, intent: normalizeIntent(intent) });
}

export async function executeTrackedAction<T>({
  tracking,
  action,
  intent,
  run,
}: {
  /** null until a wallet identity is available: runs untracked */
  tracking: AttemptTracking | null;
  action: string;
  intent: unknown;
  run: (hooks: AttemptHooks) => Promise<T>;
}): Promise<T> {
  if (!tracking) return run(NO_HOOKS);

  const { store } = tracking;
  const { result } = await runDirectAttempt({
    ...tracking,
    action,
    intentFingerprint: intentFingerprintFor(action, intent),
    execute: async ({ attempt, resolve }) => {
      try {
        return await run({
          onSubmitted: (opHash) => {
            // The guarded injector already recorded Dynamic broadcasts
            if (store.get(attempt.attemptId)?.phase === "prepared") {
              store.update(attempt.attemptId, {
                phase: "injected",
                ref: { mode: "mvrk", opHash },
              });
            }
          },
          onApplied: () => resolve("applied"),
        });
      } catch (error) {
        if (error instanceof OperationFailedOnChainError) {
          resolve("failed", error.message);
        }
        throw error;
      }
    },
  });

  return result;
}
