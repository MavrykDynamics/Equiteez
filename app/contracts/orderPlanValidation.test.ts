import { beforeEach, describe, expect, it, vi } from "vitest";
import { validateOrderPlan } from "./orderPlanValidation";
import type { PermitRuntime } from "./permit";
import type { OrderPlanRequest } from "~/lib/relay/orderPlan";
const mocks = vi.hoisted(() => ({ orders: vi.fn() }));
vi.mock("~/lib/apis/rwa/orders/orders", () => ({
  fetchWalletOpenOrders: mocks.orders,
}));
const cancel: OrderPlanRequest = {
  kind: "cancel_orders",
  orderbookAddress: "book",
  orders: [{ orderbookAddress: "book", orderId: "1", orderType: "BUY" }],
};
function setup() {
  let revision = 0;
  const balance = vi.fn(async () => "100");
  const view = vi.fn(() => ({ executeView: balance }));
  const at = vi.fn(async () => ({ contractViews: { get_balance: view } }));
  const runtime = {
    tezos: { contract: { at } },
    getScope: () => ({ wallet: "wallet", revision }),
  } as unknown as PermitRuntime;
  return {
    runtime,
    balance,
    view,
    at,
    switchWallet: () => {
      revision++;
    },
  };
}
beforeEach(() => vi.clearAllMocks());
describe("fresh plan validation", () => {
  it("reconciles pages and requires the exact book, side and ID", async () => {
    mocks.orders
      .mockResolvedValueOnce({
        page: 1,
        total_pages: 2,
        truncated: false,
        items: [
          {
            orderbook_address: "other",
            order_id: "1",
            side: "buy",
            can_cancel: true,
          },
        ],
      })
      .mockResolvedValueOnce({
        page: 2,
        total_pages: 2,
        truncated: false,
        items: [
          {
            orderbook_address: "book",
            order_id: "1",
            side: "limit_buy",
            can_cancel: true,
          },
        ],
      });
    await validateOrderPlan(setup().runtime, cancel);
    expect(mocks.orders).toHaveBeenCalledTimes(2);
  });
  it.each(["pending", "claimed", undefined])(
    "blocks refund status %s",
    async (status) => {
      mocks.orders.mockResolvedValue({
        page: 1,
        total_pages: 1,
        truncated: false,
        items: [
          {
            orderbook_address: "book",
            order_id: "1",
            side: "buy",
            refund: { status },
          },
        ],
      });
      await expect(
        validateOrderPlan(setup().runtime, {
          kind: "process_refund",
          orderbookAddress: "book",
          order: { orderId: "1", orderType: "BUY" },
        })
      ).rejects.toThrow("not claimable");
    }
  );
  it("accepts claimable refund without balance read", async () => {
    const f = setup();
    mocks.orders.mockResolvedValue({
      page: 1,
      total_pages: 1,
      truncated: false,
      items: [
        {
          orderbook_address: "book",
          order_id: "1",
          side: "buy",
          refund: { status: "claimable" },
        },
      ],
    });
    await validateOrderPlan(f.runtime, {
      kind: "process_refund",
      orderbookAddress: "book",
      order: { orderId: "1", orderType: "BUY" },
    });
    expect(f.at).not.toHaveBeenCalled();
  });
  it.each([true, false])(
    "blocks incomplete or missing reconciled rows (truncated %s)",
    async (truncated) => {
      mocks.orders.mockResolvedValue({
        page: 1,
        total_pages: 1,
        truncated,
        items: [],
      });
      await expect(
        validateOrderPlan(setup().runtime, cancel)
      ).rejects.toThrow();
    }
  );
  it("rejects wallet changes during reconciliation", async () => {
    const f = setup();
    mocks.orders.mockImplementation(async () => {
      f.switchWallet();
      return { page: 1, total_pages: 1, items: [] };
    });
    await expect(validateOrderPlan(f.runtime, cancel)).rejects.toThrow(
      "Wallet changed"
    );
  });
  it.each(["place_buy_order", "place_sell_order"] as const)(
    "checks exact token and ID for %s",
    async (kind) => {
      const f = setup();
      const request: OrderPlanRequest = {
        kind,
        book: {
          address: "book",
          baseTokenAddress: "base",
          rwaTokenId: "7",
          quoteTokenAddress: "quote",
          quoteTokenId: "3",
          currencyKey: "USD",
          tickSize: "1",
          quantityTickSize: "1",
          minBuyOrderAmount: "1",
          minSellOrderAmount: "1",
          minBuyOrderValue: "1",
          minSellOrderValue: "1",
        },
        order: {
          rwaTokenAmount: "20",
          pricePerRwaToken: "30",
          baseTokenDecimals: 1,
          currency: "USD",
          orderExpiry: null,
          isMarketOrder: true,
          quantityTickSizeAtoms: "1",
        },
      };
      await validateOrderPlan(f.runtime, request);
      expect(f.at).toHaveBeenCalledWith(
        kind === "place_buy_order" ? "quote" : "base"
      );
      expect(f.view).toHaveBeenCalledWith({
        owner: "wallet",
        token_id: kind === "place_buy_order" ? "3" : "7",
      });
      f.balance.mockResolvedValue("0");
      await expect(validateOrderPlan(f.runtime, request)).rejects.toThrow(
        "balance"
      );
      f.balance.mockRejectedValue(new Error("RPC unavailable"));
      await expect(validateOrderPlan(f.runtime, request)).rejects.toThrow(
        "RPC unavailable"
      );
    }
  );
});
