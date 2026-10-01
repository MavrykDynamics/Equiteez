import { describe, expect, it, vi } from "vitest";
import {
  parsePrimaryPurchaseHistoryItem,
  fetchPrimaryPurchaseHistory,
} from "./primaryPurchases";
import { MavrykChainId } from "~/lib/mavryk/types";
import { fetchGetOperationsTransactions } from "~/lib/apis/tzkt";

const mocks = vi.hoisted(() => ({ transactions: vi.fn() }));
vi.mock("~/lib/apis/tzkt", () => ({
  fetchGetOperationsTransactions: mocks.transactions,
}));
const base = {
  type: "transaction",
  hash: "operation",
  counter: 7,
  timestamp: "2026-10-01T08:00:15Z",
  status: "applied",
};
const purchase = {
  ...base,
  id: 1,
  sender: { address: "buyer" },
  target: { address: "launchpad" },
  parameter: {
    entrypoint: "purchase",
    value: {
      amount: "1500000",
      launchName: "launch",
      saleOption: "Starter",
      payment: "USDT",
      maxTotalPayment: "99000000",
    },
  },
  diffs: [
    {
      path: "launchLedger",
      content: {
        key: "launch",
        value: {
          tokenContractAddress: "asset",
          saleOptions: {
            Starter: {
              payments: {
                USDT: {
                  currency: {
                    fa2: { tokenContractAddress: "payment", tokenId: "0" },
                  },
                },
              },
            },
          },
        },
      },
    },
  ],
};
const payment = (id: number, amount: string, counter = 7, from = "buyer") => ({
  ...base,
  id,
  counter,
  sender: { address: "launchpad" },
  target: { address: "payment" },
  parameter: {
    entrypoint: "transfer",
    value: [{ from_: from, txs: [{ to_: "treasury", amount, token_id: "0" }] }],
  },
});
const identity = {
  wallet: "buyer",
  assetAddress: "asset",
  launchpad: "launchpad",
  paymentAddress: "payment",
  paymentTokenId: "0",
};
const parse = (operations: unknown, override = {}) =>
  parsePrimaryPurchaseHistoryItem({
    ...identity,
    purchaseId: 1,
    operations,
    ...override,
  });

describe("primary purchase history", () => {
  it("sums discounted fee and treasury legs, excluding other counters, wallets and network fees", () => {
    expect(
      parse([
        purchase,
        payment(2, "44550000"),
        payment(3, "225000"),
        payment(4, "1000000", 8),
        payment(5, "1000000", 7, "other"),
      ])
    ).toMatchObject({
      amount: "1.5",
      total: "44.775",
      price: "29.85",
    });
  });
  it("supports a single payment leg and preserves values beyond safe integers", () => {
    expect(parse([purchase, payment(2, "9007199254740993")])?.total).toBe(
      "9007199254.740993"
    );
  });
  it("excludes another asset using historical launch identity", () => {
    expect(parse([purchase], { assetAddress: "other" })).toBeNull();
  });
  it("rejects missing payment legs rather than using the cap or live price", () => {
    expect(() => parse([purchase])).toThrow("incomplete");
  });
  it("rejects failed purchases, other wallets and admin-recorded allocations", () => {
    expect(() => parse([{ ...purchase, status: "failed" }])).toThrow();
    expect(() => parse([purchase], { wallet: "other" })).toThrow();
    expect(() =>
      parse([
        {
          ...purchase,
          parameter: { entrypoint: "setPurchaseRecord", value: [] },
        },
      ])
    ).toThrow();
  });
  it("requires historical identity and the supported payment currency", () => {
    expect(() => parse([{ ...purchase, diffs: [] }])).toThrow(
      "Historical launch"
    );
    expect(() => parse([purchase], { paymentAddress: "different" })).toThrow(
      "unsupported"
    );
  });
  it("advances the explicit ID cursor after 100 purchases", async () => {
    const operations = Array.from({ length: 101 }, (_, index) => ({
      ...purchase,
      id: 101 - index,
      hash: String(101 - index),
    }));
    mocks.transactions
      .mockResolvedValueOnce(operations.slice(0, 100))
      .mockResolvedValueOnce(operations.slice(100));
    const rows = await fetchPrimaryPurchaseHistory({
      ...identity,
      chainId: MavrykChainId.Basenet,
      loadOperation: async (hash) => [
        operations.find((operation) => operation.hash === hash),
        { ...payment(1000, "45000000"), hash },
      ],
    });
    expect(rows).toHaveLength(101);
    expect(new Set(rows.map((row) => row.id)).size).toBe(101);
    expect(fetchGetOperationsTransactions).toHaveBeenLastCalledWith(
      MavrykChainId.Basenet,
      expect.objectContaining({ "id.lt": 2 })
    );
  });
  it("loads only applied direct purchases for the wallet and deployment", async () => {
    mocks.transactions.mockResolvedValueOnce([purchase] as never);
    const loadOperation = vi
      .fn()
      .mockResolvedValue([purchase, payment(2, "45000000")]);
    const rows = await fetchPrimaryPurchaseHistory({
      ...identity,
      chainId: MavrykChainId.Basenet,
      loadOperation,
    });
    expect(rows).toHaveLength(1);
    expect(fetchGetOperationsTransactions).toHaveBeenCalledWith(
      MavrykChainId.Basenet,
      expect.objectContaining({
        sender: "buyer",
        target: "launchpad",
        status: "applied",
        entrypoint: "purchase",
      })
    );
  });
});
