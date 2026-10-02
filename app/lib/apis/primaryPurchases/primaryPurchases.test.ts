import { beforeEach, expect, it, vi } from "vitest";
import { fetchPrimaryPurchaseHistory } from "./primaryPurchases";
import { FreshnessSource, markFreshQuery } from "~/lib/apis/rwa/freshness";

const mocks = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock("~/lib/apis/rwa/client", () => ({ rwaApi: { get: mocks.get } }));

beforeEach(() => {
  mocks.get.mockReset();
  mocks.get.mockResolvedValue({
    headers: {},
    data: {
      items: [
        {
          id: "transfer:1",
          type: "deposit",
          datetime: "2026-10-01T08:00:15Z",
          token_address: "asset",
          operation_hash: null,
          amount: 1,
          currency: "usd",
          price_per_token: null,
          total: null,
          chain_from: "mavryk",
          chain_to: "mavryk",
        },
      ],
      page: 1,
      per_page: 10,
      total: 1,
      total_pages: 1,
      truncated: false,
      as_of: {},
    },
  });
});

it("requests only asset receipts from RWA and preserves missing execution data", async () => {
  const result = await fetchPrimaryPurchaseHistory({
    walletAddress: "buyer",
    tokenAddress: "asset",
    page: 1,
    perPage: 10,
    sort: "date_desc",
  });
  const url = new URL(mocks.get.mock.calls[0][0], "https://example.com");
  expect(url.pathname).toBe("/wallets/buyer/transactions");
  expect(Object.fromEntries(url.searchParams)).toMatchObject({
    token_address: "asset",
    page: "1",
    per_page: "10",
    sort: "date_desc",
    types: "deposit",
  });
  expect(url.searchParams.getAll("types")).toEqual(["deposit"]);
  expect(result.items[0]).toMatchObject({
    type: "deposit",
    operation_hash: null,
    total: null,
  });
  expect(result.items[0].status).toBeUndefined();
});

it("honors transfer freshness marks from purchase confirmation", async () => {
  markFreshQuery("fetchWalletTransferHistory", {
    source: FreshnessSource.Chain,
  });
  await fetchPrimaryPurchaseHistory({
    walletAddress: "buyer",
    tokenAddress: "asset",
  });
  expect(mocks.get.mock.calls[0][0]).toContain("fresh=1");
});

it("propagates API errors instead of reporting empty history", async () => {
  mocks.get.mockRejectedValueOnce(new Error("unavailable"));
  await expect(
    fetchPrimaryPurchaseHistory({ walletAddress: "buyer" })
  ).rejects.toThrow("unavailable");
});
