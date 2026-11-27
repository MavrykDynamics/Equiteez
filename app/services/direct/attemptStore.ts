/**
 * Durable record of direct-execution attempts.
 *
 * localStorage: non-secret metadata (identity, fingerprint, hash, phase).
 *   Unresolved attempts survive reload and logout until a receipt resolves
 *   them; terminal ones are pruned after TERMINAL_RETENTION_MS.
 * sessionStorage: the exact signed bytes for a same-hash rebroadcast. Never
 *   in localStorage, logs or analytics; cleared as soon as the attempt
 *   resolves.
 */
import {
  TERMINAL_PHASES,
  type AttemptScope,
  type DirectAttempt,
} from "./attempt.types";

const ATTEMPTS_KEY = "equiteez:direct-attempts:v1";
const RETRY_BYTES_KEY_PREFIX = "equiteez:direct-attempt-bytes:";
export const TERMINAL_RETENTION_MS = 24 * 60 * 60 * 1000;

/** Persisting failed: the operation must not be broadcast untracked. */
export class AttemptPersistenceError extends Error {
  constructor(cause?: unknown) {
    super(
      "Your browser blocked saving the transaction state, so it was not sent."
    );
    this.name = "AttemptPersistenceError";
    this.cause = cause;
  }
}

type KeyValueStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export const sameScope = (a: AttemptScope, b: AttemptScope) =>
  a.environment === b.environment &&
  a.chainId === b.chainId &&
  a.address === b.address;

export type AttemptStore = ReturnType<typeof createAttemptStore>;

export function createAttemptStore({
  local,
  session,
  now = Date.now,
}: {
  local: KeyValueStorage | null;
  session: KeyValueStorage | null;
  now?: () => number;
}) {
  const readAll = (): DirectAttempt[] => {
    try {
      const raw = local?.getItem(ATTEMPTS_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];

      return Array.isArray(parsed) ? (parsed as DirectAttempt[]) : [];
    } catch {
      return [];
    }
  };

  /** Throws AttemptPersistenceError: callers must not proceed unrecorded. */
  const writeAll = (attempts: DirectAttempt[]) => {
    if (!local) throw new AttemptPersistenceError();

    try {
      local.setItem(ATTEMPTS_KEY, JSON.stringify(attempts));
    } catch (error) {
      throw new AttemptPersistenceError(error);
    }
  };

  const get = (attemptId: string) =>
    readAll().find((attempt) => attempt.attemptId === attemptId) ?? null;

  const list = (scope: AttemptScope) =>
    readAll().filter((attempt) => sameScope(attempt.identity, scope));

  const create = (
    attempt: Omit<DirectAttempt, "createdAt" | "updatedAt">
  ): DirectAttempt => {
    const timestamp = now();
    const record = { ...attempt, createdAt: timestamp, updatedAt: timestamp };

    writeAll([...readAll(), record]);
    return record;
  };

  const update = (
    attemptId: string,
    patch: Partial<Omit<DirectAttempt, "attemptId" | "identity" | "createdAt">>
  ): DirectAttempt => {
    const attempts = readAll();
    const index = attempts.findIndex(
      (attempt) => attempt.attemptId === attemptId
    );

    if (index === -1) throw new AttemptPersistenceError();

    const record = { ...attempts[index], ...patch, updatedAt: now() };
    attempts[index] = record;
    writeAll(attempts);

    if (TERMINAL_PHASES.has(record.phase)) clearRetryBytes(attemptId);

    return record;
  };

  /** Drops terminal attempts older than the retention window; never unresolved ones. */
  const prune = () => {
    const cutoff = now() - TERMINAL_RETENTION_MS;
    const attempts = readAll();
    const kept = attempts.filter(
      (attempt) =>
        !TERMINAL_PHASES.has(attempt.phase) || attempt.updatedAt >= cutoff
    );

    if (kept.length !== attempts.length) {
      try {
        writeAll(kept);
      } catch {
        // Pruning is housekeeping; a full storage keeps the old list
      }
    }
  };

  const setRetryBytes = (attemptId: string, signedBytes: string) => {
    try {
      session?.setItem(RETRY_BYTES_KEY_PREFIX + attemptId, signedBytes);
    } catch {
      // Without retry bytes the attempt can only be resolved by receipt
    }
  };

  const getRetryBytes = (attemptId: string) => {
    try {
      return session?.getItem(RETRY_BYTES_KEY_PREFIX + attemptId) ?? null;
    } catch {
      return null;
    }
  };

  function clearRetryBytes(attemptId: string) {
    try {
      session?.removeItem(RETRY_BYTES_KEY_PREFIX + attemptId);
    } catch {
      // Session storage is cleared with the tab anyway
    }
  }

  return {
    get,
    list,
    create,
    update,
    prune,
    setRetryBytes,
    getRetryBytes,
    clearRetryBytes,
  };
}

function safeStorage(kind: "localStorage" | "sessionStorage") {
  try {
    return typeof window === "undefined" ? null : window[kind];
  } catch {
    return null;
  }
}

let browserStore: AttemptStore | null = null;

export function getBrowserAttemptStore(): AttemptStore {
  browserStore ??= createAttemptStore({
    local: safeStorage("localStorage"),
    session: safeStorage("sessionStorage"),
  });

  return browserStore;
}
