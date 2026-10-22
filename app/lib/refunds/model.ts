import { z } from "zod";

const nat = z.string().regex(/^(0|[1-9][0-9]*)$/);
export const refundItemSchema = z.object({
  orderbook_address: z.string(),
  order_id: nat,
  order_type: z.enum(["BUY", "SELL"]),
  availability: z.enum(["eligible", "blocked"]),
  blocked_reason: z.string().nullable(),
  refund: z
    .object({
      token_address: z.string(),
      token_id: nat,
      amount_units: nat,
      decimals: z.number().int().min(0).max(38).nullable(),
      symbol: z.string(),
    })
    .nullable(),
});
export const refundPageSchema = z.object({
  items: z.array(refundItemSchema),
  next_cursor: z.string().nullable(),
  has_more: z.boolean(),
  as_of: z.object({
    orderbook: z.object({
      level: z.number().int().nonnegative(),
      timestamp: z.string(),
      realtime: z.boolean(),
    }),
  }),
});
export type RefundItem = z.infer<typeof refundItemSchema>;
export type RefundPage = z.infer<typeof refundPageSchema>;
export type Snapshot = {
  items: RefundItem[];
  level: number;
  realtime: boolean;
};
export type RefundOrder = { orderId: string; orderType: "BUY" | "SELL" };
export type Mode = "credits" | "mvrk";
export type Payout = { token: string; id: string; units: string };
export type Chunk = {
  book: string;
  orders: RefundOrder[];
  state:
    | "ready"
    | "signing"
    | "signed"
    | "submitting"
    | "submitted"
    | "applied"
    | "confirmed"
    | "failed"
    | "unknown";
  payouts?: Payout[];
  request?: Record<string, unknown>;
  operationId?: string;
  hash?: string;
  level?: number;
  error?: string;
};
export type RefundRun = {
  version: 1;
  wallet: string;
  chain: string;
  asset: string;
  mode: Mode;
  items: RefundItem[];
  chunks: Chunk[];
  feePerChunk: string;
  feeDecimals: number;
  feeToken: string;
};

export const identity = (item: RefundItem) =>
  `${item.orderbook_address}:${item.order_type}:${item.order_id}`;

// An empty projected page may still advance the raw cursor. Never infer completion
// from item count, and never publish a partially fetched preview after an error.
export async function collectRefunds(
  read: (cursor?: string) => Promise<RefundPage>
): Promise<Snapshot> {
  const items = new Map<string, RefundItem>();
  const cursors = new Set<string>();
  let cursor: string | undefined,
    level = Number.MAX_SAFE_INTEGER,
    previous = 0,
    realtime = true;
  for (;;) {
    const page = refundPageSchema.parse(await read(cursor));
    const head = page.as_of.orderbook;
    if (head.level < previous)
      throw new Error("The indexer moved backwards. Refresh the refund list.");
    previous = head.level;
    level = Math.min(level, head.level);
    realtime &&= head.realtime;
    for (const item of page.items) {
      const key = identity(item),
        existing = items.get(key);
      if (existing && JSON.stringify(existing) !== JSON.stringify(item))
        throw new Error(
          "Refund data changed during preparation. Refresh the list."
        );
      items.set(key, item);
    }
    if (!page.has_more) return { items: [...items.values()], level, realtime };
    if (!page.next_cursor || cursors.has(page.next_cursor))
      throw new Error("The refund list did not advance. Please retry.");
    cursors.add(page.next_cursor);
    cursor = page.next_cursor;
  }
}

export function chunksFor(items: RefundItem[], maxOrders: number): Chunk[] {
  if (!Number.isInteger(maxOrders) || maxOrders < 1 || maxOrders > 100)
    throw new Error("Invalid refund chunk size");
  const groups = new Map<string, RefundOrder[]>();
  const seen = new Set<string>();
  for (const item of items) {
    if (
      item.availability !== "eligible" ||
      !item.refund ||
      BigInt(item.refund.amount_units) <= 0n ||
      seen.has(identity(item))
    )
      continue;
    seen.add(identity(item));
    const list = groups.get(item.orderbook_address) ?? [];
    list.push({ orderId: item.order_id, orderType: item.order_type });
    groups.set(item.orderbook_address, list);
  }
  return [...groups]
    .sort(([a], [b]) => a.localeCompare(b))
    .flatMap(([book, orders]) => {
      orders.sort(
        (a, b) =>
          a.orderType.localeCompare(b.orderType) ||
          (BigInt(a.orderId) < BigInt(b.orderId)
            ? -1
            : BigInt(a.orderId) > BigInt(b.orderId)
              ? 1
              : 0)
      );
      return Array.from(
        { length: Math.ceil(orders.length / maxOrders) },
        (_, i) => ({
          book,
          orders: orders.slice(i * maxOrders, (i + 1) * maxOrders),
          state: "ready" as const,
        })
      );
    });
}

export function totals(items: RefundItem[]) {
  const byToken = new Map<
    string,
    {
      token: string;
      id: string;
      symbol: string;
      decimals: number;
      units: bigint;
    }
  >();
  for (const item of items) {
    const r = item.refund;
    if (item.availability !== "eligible" || !r || r.decimals === null) continue;
    const key = `${r.token_address}:${r.token_id}`,
      old = byToken.get(key);
    if (old && (old.decimals !== r.decimals || old.symbol !== r.symbol))
      throw new Error("Conflicting refund token metadata");
    byToken.set(key, {
      token: r.token_address,
      id: r.token_id,
      symbol: r.symbol,
      decimals: r.decimals,
      units: (old?.units ?? 0n) + BigInt(r.amount_units),
    });
  }
  return [...byToken.values()];
}
export function formatUnits(units: bigint, decimals: number): string {
  if (decimals === 0) return units.toString();
  const s = units.toString().padStart(decimals + 1, "0");
  return `${s.slice(0, -decimals)}.${s.slice(-decimals)}`.replace(/\.?0+$/, "");
}

export const unresolved = (run: RefundRun) =>
  run.chunks.some((c) =>
    [
      "signing",
      "signed",
      "submitting",
      "submitted",
      "applied",
      "unknown",
    ].includes(c.state)
  );
export const runKey = (wallet: string, chain: string, asset: string) =>
  `asset-refunds:v1:${chain}:${wallet}:${asset}`;

export function restoreRun(
  raw: string,
  wallet: string,
  chain: string,
  asset: string
): RefundRun {
  const order = z.object({ orderId: nat, orderType: z.enum(["BUY", "SELL"]) });
  const parsed = z
    .object({
      version: z.literal(1),
      wallet: z.literal(wallet),
      chain: z.literal(chain),
      asset: z.literal(asset),
      mode: z.enum(["credits", "mvrk"]),
      items: z.array(refundItemSchema),
      feePerChunk: nat,
      feeDecimals: z.number().int().min(0).max(38),
      feeToken: z.string(),
      chunks: z.array(
        z.object({
          book: z.string(),
          orders: z.array(order).min(1).max(100),
          state: z.enum([
            "ready",
            "signing",
            "signed",
            "submitting",
            "submitted",
            "applied",
            "confirmed",
            "failed",
            "unknown",
          ]),
          payouts: z
            .array(z.object({ token: z.string(), id: nat, units: nat }))
            .optional(),
          request: z.record(z.unknown()).optional(),
          operationId: z.string().optional(),
          hash: z.string().optional(),
          level: z.number().int().optional(),
          error: z.string().optional(),
        })
      ),
    })
    .parse(JSON.parse(raw));
  for (const c of parsed.chunks) {
    if (c.state === "signing")
      c.state = parsed.mode === "credits" ? "ready" : "unknown";
  }
  return parsed;
}

// Receipt-derived payouts, never preview amounts: an already-refunded order can
// produce an applied no-op. Only confirmed chunks contribute to this total.
export function receivedTotals(run: RefundRun) {
  const metadata = new Map<string, NonNullable<RefundItem["refund"]>>(
    run.items.flatMap((i) =>
      i.refund
        ? [
            [
              `${i.refund.token_address}:${i.refund.token_id}`,
              i.refund,
            ] as const,
          ]
        : []
    )
  );
  const sums = new Map<string, Payout>();
  for (const c of run.chunks) {
    if (c.state !== "confirmed") continue;
    for (const p of c.payouts ?? []) {
      const key = `${p.token}:${p.id}`;
      sums.set(key, {
        ...p,
        units: (
          BigInt(sums.get(key)?.units ?? "0") + BigInt(p.units)
        ).toString(),
      });
    }
  }
  return [...sums].map(([key, p]) => ({
    ...p,
    decimals: metadata.get(key)?.decimals ?? null,
    symbol: metadata.get(key)?.symbol ?? "",
  }));
}
