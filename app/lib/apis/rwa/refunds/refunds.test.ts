import { AxiosError, AxiosHeaders } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { rwaApi } from "~/lib/apis/rwa/client";
import {
  assertRefundPartClaimable,
  collectAssetRefunds,
} from "~/lib/apis/rwa/refunds/refunds";
import {
  buildAssetRefundsScan,
  formatRefundUnits,
  REFUND_PART_MAX_ORDERS,
  RefundsScanError,
} from "~/lib/apis/rwa/refunds/refunds.helpers";
import type { RefundItemType } from "~/lib/apis/rwa/refunds/refunds.types";

vi.mock("~/lib/apis/rwa/client", () => ({
  rwaApi: { get: vi.fn() },
}));

const getMock = vi.mocked(rwaApi.get);

const makeItem = (overrides: Partial<RefundItemType> = {}): RefundItemType => ({
  orderbook_address: "KT1Book",
  order_id: "1",
  order_type: "BUY",
  refund: {
    token_address: "KT1Usdt",
    token_id: "0",
    amount_units: "1000000",
    decimals: 6,
    symbol: "USDT",
  },
  availability: "eligible",
  blocked_reason: null,
  ...overrides,
});

const makePage = (
  items: RefundItemType[],
  nextCursor: string | null,
  { level = 100, realtime = true } = {}
) => ({
  data: {
    as_of: {
      orderbook: { level, timestamp: "2026-10-22T07:00:00Z", realtime },
    },
    items,
    next_cursor: nextCursor,
    has_more: nextCursor !== null,
  },
});

const makeHttpError = (status: number, headers: Record<string, string> = {}) =>
  new AxiosError("error", String(status), undefined, undefined, {
    status,
    statusText: "",
    headers,
    config: { headers: new AxiosHeaders() },
    data: null,
  });

const scanParams = { walletAddress: "mv1Wallet", tokenAddress: "KT1Rwa" };

describe("collectAssetRefunds", () => {
  beforeEach(() => {
    getMock.mockReset();
  });

  it("follows cursors until has_more is false, including empty pages", async () => {
    getMock
      .mockResolvedValueOnce(makePage([makeItem({ order_id: "1" })], "c1"))
      .mockResolvedValueOnce(makePage([], "c2"))
      .mockResolvedValueOnce(makePage([makeItem({ order_id: "2" })], null));

    const scan = await collectAssetRefunds(scanParams);

    expect(getMock).toHaveBeenCalledTimes(3);
    expect(getMock.mock.calls[1][0]).toContain("cursor=c1");
    expect(getMock.mock.calls[2][0]).toContain("cursor=c2");
    expect(scan.eligibleCount).toBe(2);
  });

  it("fails on a repeated cursor instead of returning a partial list", async () => {
    getMock
      .mockResolvedValueOnce(makePage([makeItem()], "c1"))
      .mockResolvedValueOnce(makePage([], "c1"));

    await expect(collectAssetRefunds(scanParams)).rejects.toBeInstanceOf(
      RefundsScanError
    );
  });

  it("fails when a later page errors", async () => {
    getMock
      .mockResolvedValueOnce(makePage([makeItem()], "c1"))
      .mockRejectedValueOnce(makeHttpError(503));

    await expect(collectAssetRefunds(scanParams)).rejects.toThrow();
  });

  it("retries the same page after 429", async () => {
    vi.useFakeTimers();
    getMock
      .mockResolvedValueOnce(makePage([makeItem({ order_id: "1" })], "c1"))
      .mockRejectedValueOnce(makeHttpError(429, { "retry-after": "1" }))
      .mockResolvedValueOnce(makePage([makeItem({ order_id: "2" })], null));

    const scanPromise = collectAssetRefunds(scanParams);
    await vi.advanceTimersByTimeAsync(1_000);
    const scan = await scanPromise;

    expect(getMock.mock.calls[2][0]).toContain("cursor=c1");
    expect(scan.eligibleCount).toBe(2);
    vi.useRealTimers();
  });

  it("restarts from the first page on 409", async () => {
    getMock
      .mockResolvedValueOnce(makePage([makeItem({ order_id: "1" })], "c1"))
      .mockRejectedValueOnce(makeHttpError(409))
      .mockResolvedValueOnce(makePage([makeItem({ order_id: "3" })], null));

    const scan = await collectAssetRefunds(scanParams);

    expect(getMock.mock.calls[2][0]).not.toContain("cursor=");
    expect(scan.parts[0].orders).toEqual([{ orderId: "3", orderType: "BUY" }]);
  });

  it("marks the scan as not realtime when any page is stale", async () => {
    getMock
      .mockResolvedValueOnce(makePage([makeItem()], "c1"))
      .mockResolvedValueOnce(makePage([], null, { realtime: false }));

    const scan = await collectAssetRefunds(scanParams);

    expect(scan.isRealtime).toBe(false);
  });
});

describe("buildAssetRefundsScan", () => {
  it("keeps BUY and SELL with the same ID distinct and sorts BUY first", () => {
    const scan = buildAssetRefundsScan({
      items: [
        makeItem({ order_id: "12", order_type: "SELL" }),
        makeItem({ order_id: "12", order_type: "BUY" }),
        makeItem({ order_id: "9", order_type: "BUY" }),
      ],
      isRealtime: true,
      level: 1,
    });

    expect(scan.parts).toEqual([
      {
        orderbookAddress: "KT1Book",
        orders: [
          { orderId: "9", orderType: "BUY" },
          { orderId: "12", orderType: "BUY" },
          { orderId: "12", orderType: "SELL" },
        ],
      },
    ]);
  });

  it("splits parts per orderbook and by max part size", () => {
    const items = Array.from({ length: REFUND_PART_MAX_ORDERS + 1 }, (_, i) =>
      makeItem({ order_id: String(i) })
    );

    const scan = buildAssetRefundsScan({
      items: [...items, makeItem({ orderbook_address: "KT1Old" })],
      isRealtime: true,
      level: 1,
    });

    expect(scan.parts.map((part) => part.orderbookAddress)).toEqual([
      "KT1Book",
      "KT1Book",
      "KT1Old",
    ]);
    expect(scan.parts[0].orders).toHaveLength(REFUND_PART_MAX_ORDERS);
  });

  it("sums per token exactly and separates blocked candidates", () => {
    const scan = buildAssetRefundsScan({
      items: [
        makeItem({
          order_id: "1",
          refund: {
            token_address: "KT1Usdt",
            token_id: "0",
            amount_units: "9007199254740993",
            decimals: 6,
            symbol: "USDT",
          },
        }),
        makeItem({ order_id: "2" }),
        makeItem({
          order_id: "3",
          order_type: "SELL",
          refund: {
            token_address: "KT1Rwa",
            token_id: "0",
            amount_units: "5",
            decimals: 0,
            symbol: "RWA",
          },
        }),
        makeItem({
          order_id: "4",
          availability: "blocked",
          blocked_reason: "process_refund_paused",
        }),
        makeItem({ order_id: "5", refund: null }),
      ],
      isRealtime: true,
      level: 1,
    });

    expect(scan.eligibleCount).toBe(3);
    expect(scan.blockedCount).toBe(2);
    expect(scan.totals).toHaveLength(2);
    expect(scan.totals[0].amountUnits).toBe(9007199255740993n);
    expect(scan.totals[1].amountUnits).toBe(5n);
  });

  it("rejects conflicting duplicates", () => {
    expect(() =>
      buildAssetRefundsScan({
        items: [
          makeItem(),
          makeItem({ availability: "blocked", blocked_reason: "x" }),
        ],
        isRealtime: true,
        level: 1,
      })
    ).toThrow(RefundsScanError);
  });
});

describe("formatRefundUnits", () => {
  it("formats integer units with exact decimals", () => {
    expect(formatRefundUnits(1250000n, 6)).toBe("1.25");
    expect(formatRefundUnits(5n, 6)).toBe("0.000005");
    expect(formatRefundUnits(3000000n, 6)).toBe("3");
    expect(formatRefundUnits(7n, 0)).toBe("7");
  });
});

describe("assertRefundPartClaimable", () => {
  const part = {
    orderbookAddress: "KT1Book",
    orders: [
      { orderId: "1", orderType: "BUY" as const },
      { orderId: "1", orderType: "SELL" as const },
    ],
  };

  beforeEach(() => {
    getMock.mockReset();
  });

  it("passes when every order of the part is still eligible", async () => {
    getMock.mockResolvedValueOnce(
      makePage([makeItem(), makeItem({ order_type: "SELL" })], null)
    );

    await expect(
      assertRefundPartClaimable({ ...scanParams, part })
    ).resolves.toBeUndefined();
  });

  it("fails when an order was claimed or became blocked", async () => {
    getMock.mockResolvedValueOnce(
      makePage(
        [
          makeItem(),
          makeItem({
            order_type: "SELL",
            availability: "blocked",
            blocked_reason: "process_refund_paused",
          }),
        ],
        null
      )
    );

    await expect(
      assertRefundPartClaimable({ ...scanParams, part })
    ).rejects.toThrow("no longer available");
  });

  it("fails on stale indexer data", async () => {
    getMock.mockResolvedValueOnce(
      makePage([makeItem(), makeItem({ order_type: "SELL" })], null, {
        realtime: false,
      })
    );

    await expect(
      assertRefundPartClaimable({ ...scanParams, part })
    ).rejects.toThrow("syncing");
  });
});
