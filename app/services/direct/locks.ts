/**
 * Locks shared by this app's tabs (Web Locks API), with an in-tab fallback
 * where the API is missing. They do not cover other devices or apps: on-chain
 * counters and fresh reads still guard those (docs/dynamic-wallet.md §8.8).
 */
import type { AttemptScope } from "./attempt.types";

/** The same action is already being submitted in this or another tab. */
export class ActionInProgressError extends Error {
  constructor() {
    super("This action is already being submitted.");
    this.name = "ActionInProgressError";
  }
}

const LOCK_PREFIX = "equiteez:direct";

export const lockNames = {
  /** One submission of the same reviewed intent at a time */
  logicalAction: (scope: AttemptScope, intentFingerprint: string) =>
    `${LOCK_PREFIX}:action:${scope.environment}:${scope.chainId}:${scope.address}:${intentFingerprint}`,
  /** Manager operations of one source share a counter: one at a time */
  managerOperation: (scope: AttemptScope) =>
    `${LOCK_PREFIX}:manager:${scope.chainId}:${scope.address}`,
  /** Workflows that read or change one FA2 operator grant */
  operatorWorkflow: (
    scope: AttemptScope,
    tokenAddress: string,
    tokenId: string,
    operator: string
  ) =>
    `${LOCK_PREFIX}:operator:${scope.chainId}:${scope.address}:${tokenAddress}:${tokenId}:${operator}`,
};

type LockManagerLike = Pick<LockManager, "request">;

function getLockManager(): LockManagerLike | null {
  if (typeof navigator === "undefined") return null;

  const { locks } = navigator as Navigator & { locks?: LockManagerLike };
  // Missing in older browsers and in Node, despite the DOM typings
  return typeof locks?.request === "function" ? locks : null;
}

// In-tab fallback: a promise chain per lock name. A name is busy from the
// moment a holder is queued, so two synchronous calls cannot both see it free.
const localQueues = new Map<string, Promise<unknown>>();

async function runLocally<T>(
  name: string,
  task: () => Promise<T>,
  ifAvailable: boolean
): Promise<T | typeof NOT_ACQUIRED> {
  if (ifAvailable && localQueues.has(name)) return NOT_ACQUIRED;

  const previous = localQueues.get(name) ?? Promise.resolve();
  let release!: () => void;
  const current = new Promise<void>((resolve) => (release = resolve));
  const queued = previous.then(() => current);

  localQueues.set(name, queued);

  try {
    await previous;
    return await task();
  } finally {
    release();
    if (localQueues.get(name) === queued) localQueues.delete(name);
  }
}

const NOT_ACQUIRED = Symbol("not-acquired");

/** Waits for the lock, then runs `task` while holding it. */
export async function withLock<T>(
  name: string,
  task: () => Promise<T>,
  locks: LockManagerLike | null = getLockManager()
): Promise<T> {
  if (locks) return locks.request(name, task) as Promise<T>;

  return runLocally(name, task, false) as Promise<T>;
}

/**
 * Runs `task` only if nobody holds the lock right now; otherwise throws
 * ActionInProgressError instead of queueing a second submission.
 */
export async function withLockIfAvailable<T>(
  name: string,
  task: () => Promise<T>,
  locks: LockManagerLike | null = getLockManager()
): Promise<T> {
  const result = locks
    ? await locks.request(name, { ifAvailable: true }, async (lock) =>
        lock ? task() : NOT_ACQUIRED
      )
    : await runLocally(name, task, true);

  if (result === NOT_ACQUIRED) throw new ActionInProgressError();
  return result as T;
}

/** True if nobody holds the lock (used to detect abandoned attempts). */
export async function isLockFree(
  name: string,
  locks: LockManagerLike | null = getLockManager()
): Promise<boolean> {
  if (locks) {
    return locks.request(name, { ifAvailable: true }, async (lock) =>
      Boolean(lock)
    ) as Promise<boolean>;
  }

  return !localQueues.has(name);
}
