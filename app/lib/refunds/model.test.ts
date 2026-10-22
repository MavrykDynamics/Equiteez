import { describe, expect, it, vi } from "vitest";
import {
  chunksFor,
  collectRefunds,
  formatUnits,
  restoreRun,
  totals,
  type RefundItem,
  type RefundPage,
} from "./model";

export function item(id = "1", book = "book"): RefundItem {
  return {
    orderbook_address: book,
    order_id: id,
    order_type: "BUY",
    availability: "eligible",
    blocked_reason: null,
    refund: {
      token_address: "quote",
      token_id: "0",
      amount_units: "9007199254740993",
      decimals: 6,
      symbol: "USD",
    },
  };
}
function page(
  items: RefundItem[],
  cursor: string | null,
  level = 100
): RefundPage {
  return {
    items,
    has_more: cursor !== null,
    next_cursor: cursor,
    as_of: { orderbook: { level, timestamp: "", realtime: true } },
  };
}
describe("asset refund preparation", () => {
  it("continues empty pages, covers large histories and deduplicates full identities", async () => {
    const read = vi
      .fn()
      .mockResolvedValueOnce(page([], "a"))
      .mockResolvedValueOnce(
        page(
          Array.from({ length: 1201 }, (_, i) => item(String(i))),
          "b",
          101
        )
      )
      .mockResolvedValueOnce(
        page(
          [
            item("1"),
            item("1", "old-book"),
            { ...item("1"), order_type: "SELL" },
          ],
          null,
          102
        )
      );
    const result = await collectRefunds(read);
    expect(result.items).toHaveLength(1203);
    expect(result.level).toBe(100);
    expect(read.mock.calls).toEqual([[undefined], ["a"], ["b"]]);
  });
  it("never returns a partial success on upstream failure, repeated cursor or rollback", async () => {
    for (const second of [
      Promise.reject(new Error("down")),
      Promise.resolve(page([], "a")),
      Promise.resolve(page([], null, 99)),
    ]) {
      // Attach the rejection synchronously while building the mock.
      const read = vi
        .fn()
        .mockResolvedValueOnce(page([item()], "a"))
        .mockImplementationOnce(() => second);
      await expect(collectRefunds(read)).rejects.toThrow();
    }
  });
  it("sums exact raw units by both token address and ID", () => {
    const other = item("2");
    other.refund!.token_id = "7";
    const result = totals([item(), item("3"), other]);
    expect(result.map((r) => r.units)).toEqual([
      18014398509481986n,
      9007199254740993n,
    ]);
    expect(formatUnits(result[0].units, 6)).toBe("18014398509.481986");
    expect(formatUnits(100n, 0)).toBe("100");
    expect(formatUnits(100000000n, 6)).toBe("100");
  });
  it("groups before signing and preserves distinct BUY/SELL identities", () => {
    const blocked = { ...item("3"), availability: "blocked" as const };
    const chunks = chunksFor(
      [
        item("9007199254740993"),
        item("2"),
        { ...item("2"), order_type: "SELL" },
        item("2", "old-book"),
        blocked,
        item("2"),
      ],
      2
    );
    expect(chunks).toHaveLength(3);
    expect(chunks.flatMap((c) => c.orders)).toHaveLength(4);
    expect(chunks[0].orders.map((o) => o.orderId)).toEqual([
      "2",
      "9007199254740993",
    ]);
  });
  it("does not silently reuse another wallet's saved run", () => {
    expect(() =>
      restoreRun(
        JSON.stringify({ version: 1, wallet: "other" }),
        "owner",
        "net",
        "asset"
      )
    ).toThrow();
  });
});
