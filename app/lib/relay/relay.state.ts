import { z } from "zod";
import {
  relayOperationSchema,
  relayRemedySchema,
} from "~/lib/apis/rwa/relay/relay.schema";
import type {
  RelayIntent,
  RelayStatus,
} from "~/lib/apis/rwa/relay/relay.types";

export const relayRowSchema = relayOperationSchema
  .partial()
  .required({ operationId: true, status: true });
export type RelayRow = z.infer<typeof relayRowSchema>;
export const relayEventSchema = relayRowSchema.extend({
  walletAddress: z.string().min(1),
  updatedAt: z.string().datetime({ offset: true }),
  error: z
    .object({
      code: z.string(),
      remedy: relayRemedySchema,
      message: z.string().optional(),
    })
    .nullable()
    .optional(),
});
export const isRelayTerminal = (status?: RelayStatus) =>
  status === "confirmed" || status === "failed" || status === "rejected";

// One merge for GET, acceptance and partial notifier frames. Older GETs may
// supply missing metadata, but may not overwrite newer socket progress/fees.
export function mergeRelayRow(
  previous: RelayRow | undefined,
  incoming: RelayRow
): RelayRow {
  if (!previous) return incoming;
  const newer = Boolean(
    incoming.updatedAt &&
      (!previous.updatedAt ||
        Date.parse(incoming.updatedAt) > Date.parse(previous.updatedAt))
  );
  const merged = newer
    ? { ...previous, ...incoming }
    : { ...incoming, ...previous };
  if (isRelayTerminal(previous.status) && !isRelayTerminal(incoming.status))
    merged.status = previous.status;
  return merged;
}
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object")
    return `{${Object.entries(value)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`)
      .join(",")}}`;
  return JSON.stringify(value);
}
export const relayIntentIdentity = (intent: RelayIntent) => canonical(intent);
export function matchesRelayIntent(intent: RelayIntent, row: RelayRow) {
  // Exact normalized intent comparison, never just kind or contract.
  return (
    row.intentKind === intent.kind &&
    canonical(row.intent) === relayIntentIdentity(intent)
  );
}
export const relayRowKey = (scope: string, id: string) =>
  ["relay", scope, "operation", id] as const;
export const relayPollInterval = (authenticatedNotifier: boolean) =>
  authenticatedNotifier ? 30_000 : 3_000;
export const isStillProcessing = (createdAt: number, now: number) =>
  now - createdAt >= 600_000;
