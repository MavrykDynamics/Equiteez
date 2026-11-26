import { z } from "zod";

import type { IntentOperation } from "~/lib/apis/intents";
import {
  intentRecordSchema,
  isIntentClosed,
  mergeIntentSnapshot,
  type IntentRecord,
} from "~/lib/intents/intentOperation";

/**
 * v3: backend v0.0.9 (source asset + settlement token request). v2 records
 * (route-based Basenet rehearsal) and v1 (draft contract) are not migrated:
 * they live under other keys and are never read.
 */
const recoverySchema = z.object({
  version: z.literal(3),
  records: z.array(intentRecordSchema),
});

export type IntentSnapshot = {
  records: ReadonlyMap<string, IntentRecord>;
  storageError: string | null;
};
type StorageAccess = () => Pick<Storage, "getItem" | "setItem">;

/** Records older than this, once settled, are dropped on save. */
const RETENTION_MS = 14 * 24 * 60 * 60 * 1000;

/** EVM hashes are case-insensitive; other networks' IDs are kept as sent. */
const normalizeHash = (hash: string) =>
  /^0x[0-9a-fA-F]+$/.test(hash) ? hash.toLowerCase() : hash;
const unionHashes = (a: readonly string[], b: readonly string[]) => [
  ...new Set([...a, ...b].map(normalizeHash)),
];

/**
 * One Equiteez account + 1Click backend environment. Kept separate from the
 * direct bridge store (`equiteez:bridge:v1:…`): different identity, different
 * lifecycle. Writes are synchronous so state survives modal close or reload
 * immediately after a wallet response.
 *
 * Records hold each operation's capability: the only way to read it again
 * (there is no capability recovery or list-by-wallet endpoint). The store is
 * application-managed localStorage scoped to this origin, account and
 * backend; capabilities never leave it except as the bearer header.
 */
export class IntentOperations {
  private snapshot: IntentSnapshot = { records: new Map(), storageError: null };
  private listeners = new Set<() => void>();
  private hasRestored = false;
  private canPersist = true;

  constructor(
    readonly account: string,
    readonly env: string,
    private readonly storage: StorageAccess,
    private readonly now: () => number = Date.now
  ) {}

  get key() {
    return `equiteez:intents:v3:${encodeURIComponent(this.env)}:${encodeURIComponent(this.account)}`;
  }

  getSnapshot = () => this.snapshot;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  private emit() {
    this.listeners.forEach((listener) => listener());
  }

  get(localId: string) {
    this.restore();
    return this.snapshot.records.get(localId);
  }

  private readStored() {
    const raw = this.storage().getItem(this.key);
    if (!raw) return [];
    const records = recoverySchema.parse(JSON.parse(raw)).records;
    if (
      records.some(
        (record) => record.account !== this.account || record.env !== this.env
      )
    )
      throw new Error("Invalid intent recovery scope");
    return records;
  }

  restore() {
    if (this.hasRestored) return;
    this.hasRestored = true;
    try {
      const records = new Map(this.snapshot.records);
      for (const record of this.readStored())
        if (!records.has(record.localId)) records.set(record.localId, record);
      this.snapshot = { ...this.snapshot, records };
    } catch {
      // Keep unreadable data in place instead of overwriting it.
      this.canPersist = false;
      this.snapshot = {
        ...this.snapshot,
        storageError:
          "Deposit recovery data could not be read. Tracking works for this session only.",
      };
    }
    this.emit();
  }

  private persist() {
    if (!this.canPersist) return;
    try {
      const records = new Map(this.snapshot.records);
      // Keep records another tab added; ours win for shared IDs.
      for (const stored of this.readStored()) {
        const current = records.get(stored.localId);
        if (!current) records.set(stored.localId, stored);
        else if (stored.sequence > current.sequence)
          records.set(stored.localId, merge(current, stored));
      }
      const cutoff = this.now() - RETENTION_MS;
      for (const [id, record] of records) {
        const isSettled =
          record.fundingState === "abandoned" ||
          record.fundingState === "rejected" ||
          isIntentClosed(record);
        if (isSettled && record.createdAt < cutoff) records.delete(id);
      }
      this.snapshot = { ...this.snapshot, records };
      this.storage().setItem(
        this.key,
        JSON.stringify({ version: 3, records: [...records.values()] })
      );
      this.snapshot = { ...this.snapshot, storageError: null };
    } catch {
      this.snapshot = {
        ...this.snapshot,
        storageError:
          "Deposit recovery data could not be saved. Keep this window open until the deposit is sent.",
      };
    }
  }

  /**
   * Local writer (modal/funding). Callers read-modify-write from `get()` and
   * bump `sequence`; a stale copy is ignored rather than overwriting newer data.
   */
  upsert(input: IntentRecord) {
    const record = intentRecordSchema.parse(input);
    if (record.account !== this.account || record.env !== this.env)
      return false;
    this.restore();
    const previous = this.snapshot.records.get(record.localId);
    if (previous && previous.sequence >= record.sequence) return false;
    const records = new Map(this.snapshot.records);
    records.set(record.localId, previous ? merge(previous, record) : record);
    this.snapshot = { ...this.snapshot, records };
    this.persist();
    this.emit();
    return true;
  }

  /** Backend writer (POST/GET responses). Monotonic; never touches funding. */
  applyBackend(localId: string, operation: IntentOperation) {
    this.restore();
    const previous = this.snapshot.records.get(localId);
    if (
      !previous ||
      (previous.operationId && previous.operationId !== operation.id)
    )
      return false;
    const backend = mergeIntentSnapshot(previous.backend, operation);
    // A successful read clears the 404 counter even without new data.
    const resetsNotFound = Boolean(previous.notFoundCount);
    if (backend === previous.backend && !resetsNotFound) return false;
    const records = new Map(this.snapshot.records);
    records.set(localId, {
      ...previous,
      operationId: operation.id,
      backend,
      lastInstructions:
        backend.fundingInstructions ?? previous.lastInstructions,
      notFoundCount: undefined,
    });
    this.snapshot = { ...this.snapshot, records };
    this.persist();
    this.emit();
    return true;
  }

  /** Small field updates owned by the tracker (receipt, access, announcements). */
  patch(
    localId: string,
    patch: Partial<
      Pick<
        IntentRecord,
        | "receipt"
        | "announced"
        | "isWidgetRequested"
        | "notFoundCount"
        | "access"
      >
    >
  ) {
    this.restore();
    const previous = this.snapshot.records.get(localId);
    if (!previous) return false;
    if (
      Object.entries(patch).every(
        ([key, value]) => previous[key as keyof IntentRecord] === value
      )
    )
      return false;
    const records = new Map(this.snapshot.records);
    records.set(localId, {
      ...previous,
      ...patch,
      sequence: previous.sequence + 1,
    });
    this.snapshot = { ...this.snapshot, records };
    this.persist();
    this.emit();
    return true;
  }
}

/** Local fields from `next`; backend snapshot and hashes merged monotonically. */
function merge(previous: IntentRecord, next: IntentRecord): IntentRecord {
  const backend = next.backend
    ? mergeIntentSnapshot(previous.backend, next.backend)
    : previous.backend;
  return {
    ...next,
    operationId: next.operationId ?? previous.operationId,
    backend,
    lastInstructions: next.lastInstructions ?? previous.lastInstructions,
    sourceHashes: unionHashes(previous.sourceHashes, next.sourceHashes),
    receipt: previous.receipt === "correlated" ? "correlated" : next.receipt,
    announced: previous.announced || next.announced,
    access: previous.access === "lost" ? "lost" : next.access,
  };
}
