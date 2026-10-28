import { z } from "zod";
import {
  relayIntentSchema,
  relaySubmitSchema,
  rfc3339Seconds,
} from "~/lib/apis/rwa/relay/relay.schema";
import {
  isRelayTerminal,
  relayIntentIdentity,
  relayRowSchema,
} from "./relay.state";

const recordSchema = z
  .object({
    version: z.literal(1),
    scope: z.string(),
    id: z.string().min(1).max(128),
    contract: z.string().min(1),
    createdAt: z.number().int().nonnegative(),
    method: z.literal("credits"),
    identity: z.string(),
    intent: relayIntentSchema.optional(),
    payload: relaySubmitSchema.optional(),
    // A top-up is never replayed (no idempotency key), so no payload is kept.
    topUp: z
      .object({
        amountUnits: z.string().regex(/^\d+$/),
        deadline: rfc3339Seconds,
        // The API answered the POST, so a complete list is authoritative.
        answered: z.boolean(),
      })
      .optional(),
    operationId: z.string().uuid().optional(),
    state: z.enum(["unknown", "tracking", "settled", "blocked"]),
    posts: z.number().int().min(0).max(4),
    nextRetryAt: z.number().nonnegative(),
    error: z.string().optional(),
    remedy: z.string().optional(),
    minimized: z.boolean(),
    dismissed: z.boolean(),
    row: relayRowSchema.optional(),
    // Client time when this tab first saw the terminal row; avoids comparing
    // server timestamps with local query times.
    settledObservedAt: z.number().nonnegative().optional(),
  })
  .strict()
  .superRefine((r, ctx) => {
    if (
      r.payload &&
      (r.payload.idempotencyKey !== r.id ||
        r.payload.operation.to !== r.contract ||
        relayIntentIdentity(r.payload.intent) !== r.identity)
    )
      ctx.addIssue({ code: "custom", message: "Invalid recovery identity" });
    if (r.row && r.row.operationId !== r.operationId)
      ctx.addIssue({ code: "custom", message: "Invalid operation identity" });
  });
export type RelayRecord = z.infer<typeof recordSchema>;
export type RelayStorage = Pick<
  Storage,
  "length" | "key" | "getItem" | "setItem"
>;
export const relayStoragePrefix = (scope: string) => `relay-attempt:${scope}:`;
const maxBytes = 128_000;
export function readRelayRecords(
  storage: RelayStorage,
  scope: string
): RelayRecord[] {
  const records: RelayRecord[] = [];
  const prefix = relayStoragePrefix(scope);
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (!key?.startsWith(prefix)) continue;
    const raw = storage.getItem(key);
    if (!raw || raw.length > maxBytes)
      throw new Error(
        "Relay recovery storage is unreadable. Restore browser storage before trading."
      );
    const record = recordSchema.parse(JSON.parse(raw));
    if (record.scope !== scope || key !== prefix + record.id)
      throw new Error("Relay recovery scope mismatch");
    records.push(record);
  }
  return records;
}
export function writeRelayRecord(storage: RelayStorage, record: RelayRecord) {
  const value = JSON.stringify(recordSchema.parse(record));
  if (value.length > maxBytes)
    throw new Error("Relay recovery record exceeds the storage limit");
  const key = relayStoragePrefix(record.scope) + record.id;
  storage.setItem(key, value);
  if (storage.getItem(key) !== value)
    throw new Error("Relay recovery storage could not be verified");
}
export function hasRelayLock(records: RelayRecord[], contract: string) {
  return records.some(
    (r) =>
      r.contract === contract &&
      r.state !== "settled" &&
      !(r.row?.updatedAt && isRelayTerminal(r.row.status))
  );
}
// Shared by the direct orderbook sender. No relay HTTP request is required.
export function assertNoStoredRelayLock(
  storage: RelayStorage,
  scope: string,
  contracts: string[]
) {
  const records = readRelayRecords(storage, scope);
  if (contracts.some((contract) => hasRelayLock(records, contract)))
    throw new Error(
      "A relay action is pending or its outcome is unknown. Recover it before sending another transaction."
    );
}
