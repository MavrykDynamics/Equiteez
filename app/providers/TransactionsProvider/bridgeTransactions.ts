import { z } from "zod";
import type { UsdtBridgeProgress } from "~/contracts/usdtBridge.contract";
import { USDT_BRIDGE } from "~/consts/usdtBridge";
import {
  bridgeDepositSchema,
  bridgeHashSchema,
  getBridgeDepositId,
  type BridgeDeposit,
} from "~/lib/apis/rwa/bridge/bridge.schema";

const progressSchema = z.object({
  step: z.enum(["approve", "lock"]),
  status: z.enum(["signature", "confirming", "confirmed"]),
  hash: bridgeHashSchema.optional(),
  confirmations: z.number().int().nonnegative().optional(),
});
const recordSchema = z.object({
  operationId: z.string().min(1),
  account: z.string().min(1),
  network: z.string().min(1),
  sender: z
    .string()
    .regex(/^0x[0-9a-fA-F]{40}$/)
    .optional(),
  amount: z
    .string()
    .regex(/^\d+(\.\d+)?$/)
    .optional(),
  sourceToken: z
    .object({
      address: z.string().regex(/^0x[0-9a-fA-F]{40}$/),
      decimals: z.number().int().nonnegative(),
    })
    .optional(),
  sequence: z.number().int().nonnegative(),
  progress: progressSchema.optional(),
  executionError: z.string().optional(),
  sourceHashes: z.array(bridgeHashSchema),
  lockedAt: z.string().datetime().optional(),
  settlement: z.enum([
    "unknown",
    "confirming",
    "signing",
    "executed",
    "stalled",
  ]),
  verification: z.enum(["local", "unverified", "unknown", "verified", "stale"]),
  backend: bridgeDepositSchema.optional(),
  announcedStatus: z.enum(["executed", "stalled"]).optional(),
});
export type BridgeTransaction = z.infer<typeof recordSchema>;
const recoverySchema = z.object({
  version: z.literal(1),
  records: z.array(recordSchema),
});
export type BridgeSettlementUpdate = {
  record: BridgeTransaction;
  shouldNotify: boolean;
};
export const bridgeNetwork = `${USDT_BRIDGE.chainId}:${USDT_BRIDGE.destinationNetwork}:${USDT_BRIDGE.address.toLowerCase()}`;
export type TransactionSnapshot = {
  transactions: ReadonlyMap<string, BridgeTransaction>;
  storageError: string | null;
  reconciliationError: string | null;
  lastCheckedAt: number | null;
};
type StorageAccess = () => Pick<Storage, "getItem" | "setItem">;

/** One account/network session; execution and settlement have separate writers. */
export class BridgeTransactions {
  private snapshot: TransactionSnapshot = {
    transactions: new Map(),
    storageError: null,
    reconciliationError: null,
    lastCheckedAt: null,
  };
  private listeners = new Set<() => void>();
  private hasRestored = false;
  private canPersist = true;
  constructor(
    readonly account: string,
    readonly network: string,
    private readonly storage: StorageAccess
  ) {}
  private get key() {
    return `equiteez:bridge:v1:${encodeURIComponent(this.network)}:${encodeURIComponent(this.account)}`;
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
  restore() {
    if (this.hasRestored) return;
    this.hasRestored = true;
    try {
      const raw = this.storage().getItem(this.key);
      if (!raw) return;
      const records = recoverySchema.parse(JSON.parse(raw)).records;
      if (
        records.some(
          (record) =>
            record.account !== this.account || record.network !== this.network
        )
      )
        throw new Error("Invalid bridge recovery scope");
      const transactions = new Map(this.snapshot.transactions);
      for (const record of records) {
        if (!transactions.has(record.operationId))
          transactions.set(record.operationId, {
            ...record,
            verification: "unverified",
          });
      }
      this.snapshot = { ...this.snapshot, transactions };
    } catch {
      this.canPersist = false; // Preserve unreadable data for recovery.
      this.snapshot = {
        ...this.snapshot,
        storageError:
          "Bridge recovery data could not be read. Tracking is available for this session only.",
      };
    }
    this.emit();
  }
  private persist() {
    if (!this.canPersist) return;
    try {
      const storage = this.storage();
      const raw = storage.getItem(this.key);
      const transactions = new Map(this.snapshot.transactions);
      // Preserve records another tab added after this session restored. Storage
      // is not transactional; the backend remains the cross-device authority.
      if (raw) {
        const records = recoverySchema.parse(JSON.parse(raw)).records;
        for (const record of records) {
          if (
            record.account !== this.account ||
            record.network !== this.network
          )
            throw new Error("Invalid bridge recovery scope");
          const wasMerged =
            record.operationId.startsWith("deposit:") &&
            [...transactions.values()].some(
              (current) =>
                !current.operationId.startsWith("deposit:") &&
                current.sourceHashes.some((hash) =>
                  record.sourceHashes.includes(hash)
                )
            );
          if (!transactions.has(record.operationId) && !wasMerged)
            transactions.set(record.operationId, {
              ...record,
              verification: "unverified",
            });
        }
      }
      this.snapshot = { ...this.snapshot, transactions };
      storage.setItem(
        this.key,
        JSON.stringify({
          version: 1,
          records: [...transactions.values()].filter(
            (item) => item.sourceHashes.length
          ),
        })
      );
      this.snapshot = { ...this.snapshot, storageError: null };
    } catch {
      this.snapshot = {
        ...this.snapshot,
        storageError:
          "Bridge recovery data could not be saved. Keep the source transaction hash before leaving.",
      };
    }
  }
  update(input: BridgeTransaction) {
    const record = recordSchema.parse(input);
    if (record.account !== this.account || record.network !== this.network)
      return;
    this.restore();
    const transactions = new Map(this.snapshot.transactions);
    const previous = transactions.get(record.operationId);
    if (previous && previous.sequence >= record.sequence) return;
    // A frame/list may arrive before the wallet resolves its broadcast promise.
    const discovered = [...transactions.values()].filter(
      (item) =>
        item.operationId.startsWith("deposit:") &&
        item.sourceHashes.some((hash) =>
          record.sourceHashes
            .map((value) => value.toLowerCase())
            .includes(hash.toLowerCase())
        )
    );
    const backendRecord = previous?.backend
      ? previous
      : discovered.length === 1
        ? discovered[0]
        : undefined;
    if (backendRecord && backendRecord.operationId !== record.operationId)
      transactions.delete(backendRecord.operationId);
    transactions.set(record.operationId, {
      ...record,
      sourceHashes: [
        ...new Set(
          [...(previous?.sourceHashes ?? []), ...record.sourceHashes].map(
            (hash) => hash.toLowerCase()
          )
        ),
      ],
      backend: backendRecord?.backend,
      settlement: backendRecord?.settlement ?? "unknown",
      verification: backendRecord?.verification ?? record.verification,
      announcedStatus: backendRecord?.announcedStatus,
    });
    this.snapshot = { ...this.snapshot, transactions };
    this.persist(); // Synchronous: before React effects or modal dismissal.
    this.emit();
  }
  markStale(message: string) {
    this.snapshot = {
      ...this.snapshot,
      reconciliationError: message,
      transactions: new Map(
        [...this.snapshot.transactions].map(([id, record]) => [
          id,
          record.verification === "verified" && record.settlement !== "executed"
            ? { ...record, verification: "stale" as const }
            : record,
        ])
      ),
    };
    this.emit();
  }
  reconcile(rows: BridgeDeposit[]): BridgeSettlementUpdate[] {
    this.restore();
    const transactions = new Map(this.snapshot.transactions);
    const announcements: BridgeSettlementUpdate[] = [];
    const seen = new Set<string>();
    let hasConflict = false;
    for (const input of rows) {
      const row = bridgeDepositSchema.parse(input);
      // Families filter supported direction only. Deployment binding supplies network identity.
      if (row.chain_from !== "ethereum" || row.chain_to !== "mavryk") continue;
      const id = getBridgeDepositId(row);
      const candidates = [...transactions.values()].filter((record) =>
        record.sourceHashes.includes(row.evm_tx_hash)
      );
      const exact = candidates.find(
        (record) => record.backend && getBridgeDepositId(record.backend) === id
      );
      // Only adopt a changed log index when the hash is unambiguous in both snapshots.
      const sameHashRows = rows.filter(
        (item) => item.evm_tx_hash === row.evm_tx_hash
      );
      const previous =
        exact ??
        (candidates.length === 1 && sameHashRows.length === 1
          ? candidates[0]
          : undefined);
      const operationId = previous?.operationId ?? `deposit:${id}`;
      seen.add(operationId);
      const older =
        previous?.backend &&
        Date.parse(row.updated_at) < Date.parse(previous.backend.updated_at);
      const equalConflict =
        previous?.backend &&
        Date.parse(row.updated_at) ===
          Date.parse(previous.backend.updated_at) &&
        JSON.stringify(row) !== JSON.stringify(previous.backend);
      const regressesSuccess =
        previous?.settlement === "executed" && row.status !== "executed";
      if (
        (older &&
          (row.status !== "executed" || previous?.settlement === "executed")) ||
        regressesSuccess ||
        (equalConflict && row.status !== "executed")
      ) {
        hasConflict = true;
        if (previous)
          transactions.set(operationId, {
            ...previous,
            verification:
              previous.settlement === "executed"
                ? previous.verification
                : "stale",
          });
        continue;
      }
      const record: BridgeTransaction = {
        ...previous,
        operationId,
        account: this.account,
        network: this.network,
        sequence: previous?.sequence ?? 0,
        sourceHashes: previous?.sourceHashes ?? [row.evm_tx_hash],
        backend: row,
        settlement: row.status,
        verification: "verified",
      };
      if (
        (row.status === "executed" || row.status === "stalled") &&
        record.announcedStatus !== row.status
      ) {
        // Do not toast old history discovered at login. Local/recovered or observed
        // in-flight deposits are eligible, including completions during disconnect.
        announcements.push({ record, shouldNotify: Boolean(previous) });
        record.announcedStatus = row.status;
      }
      transactions.set(operationId, record);
    }
    for (const [id, record] of transactions) {
      if (!seen.has(id) && record.backend && record.settlement !== "executed")
        transactions.set(id, { ...record, verification: "stale" });
    }
    this.snapshot = {
      ...this.snapshot,
      transactions,
      lastCheckedAt: Date.now(),
      reconciliationError: hasConflict
        ? "The API returned an older or conflicting bridge snapshot. Keeping the last known state."
        : null,
    };
    this.persist();
    this.emit();
    return announcements;
  }
  hasPending() {
    return [...this.snapshot.transactions.values()].some(
      (record) =>
        record.sourceHashes.length &&
        record.settlement !== "stalled" &&
        (record.settlement !== "executed" ||
          record.verification === "unverified")
    );
  }
}

export function withBridgeProgress(
  record: BridgeTransaction,
  progress: UsdtBridgeProgress
): BridgeTransaction {
  return {
    ...record,
    sequence: record.sequence + 1,
    progress,
    verification: "local",
    lockedAt:
      record.lockedAt ??
      (progress.step === "lock" && progress.hash
        ? new Date().toISOString()
        : undefined),
    sourceHashes:
      progress.step === "lock" && progress.hash
        ? [...new Set([...record.sourceHashes, progress.hash])]
        : record.sourceHashes,
  };
}
