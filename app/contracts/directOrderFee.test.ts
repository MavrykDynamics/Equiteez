import { describe, expect, it, vi } from "vitest";
import { MavrykToolkit, OpKind } from "@mavrykdynamics/taquito";
import { BigNumber } from "bignumber.js";
import {
  directFeeTotals,
  estimateDirectOrderFee,
  assertDirectAffordability,
} from "./directOrderFee";
import {
  orderbookCancelBatch,
  orderbookRefundBatch,
  orderbookCancelOrder,
  orderbookProcessRefund,
  orderbookBuy,
  orderbookSell,
} from "./orderbook.contract";

const batch = [{ kind: OpKind.TRANSACTION as const, to: "book", amount: 0 }];
function setup(balance = "1200") {
  const send = vi.fn().mockResolvedValue({
    confirmation: async () => ({ block: { header: { level: 42 } } }),
  });
  const transfer = vi.fn(() => ({ toTransferParams: () => batch[0] }));
  const toolkit = {
    wallet: {
      pkh: vi.fn().mockResolvedValue("wallet"),
      at: vi.fn().mockResolvedValue({
        methodsObject: {
          cancelOrders: transfer,
          processRefund: transfer,
          update_operators: transfer,
          placeBuyOrder: transfer,
          placeSellOrder: transfer,
        },
      }),
      batch: vi.fn(() => ({ send })),
    },
    rpc: {
      getChainId: vi.fn().mockResolvedValue("chain"),
      getBalance: vi.fn().mockResolvedValue(new BigNumber(balance)),
    },
    estimate: {
      batch: vi
        .fn()
        .mockImplementation(async (operations: unknown[]) =>
          operations.map((_, index) => ({
            suggestedFeeMumav: index === 0 ? 200 : 0,
            burnFeeMumav: index === 0 ? 1000 : 0,
          }))
        ),
    },
  };
  return {
    toolkit,
    tezos: toolkit as unknown as MavrykToolkit,
    send,
    transfer,
  };
}
describe("direct native affordability", () => {
  it("includes suggested fees, storage, reveal and native amounts in exact units", () => {
    const result = directFeeTotals(
      [
        { suggestedFeeMumav: 100, burnFeeMumav: 0 },
        { suggestedFeeMumav: 200, burnFeeMumav: 1000 },
      ],
      [{ ...batch[0], amount: 2 }]
    );
    expect(result.networkFee.toFixed()).toBe("300");
    expect(result.totalDebit.toFixed()).toBe("2001300");
  });
  it.each(["1200", "999999999999999999999999"])(
    "accepts sufficient verified balance %s",
    async (balance) => {
      const { tezos } = setup(balance);
      expect(() =>
        assertDirectAffordability({
          ...directFeeTotals(
            [{ suggestedFeeMumav: 200, burnFeeMumav: 1000 }],
            batch
          ),
          balance: new BigNumber(balance),
        })
      ).not.toThrow();
      expect(
        (await estimateDirectOrderFee(tezos, batch, "wallet")).balance.toFixed()
      ).toBe(balance);
    }
  );
  it.each([NaN, -1, 0.5, Infinity])("rejects invalid fee %s", (value) => {
    expect(() =>
      directFeeTotals([{ suggestedFeeMumav: value, burnFeeMumav: 0 }], batch)
    ).toThrow();
  });
  it.each([orderbookCancelOrder, orderbookProcessRefund])(
    "estimates and executes the same management call",
    async (action) => {
      const { tezos, toolkit, send } = setup();
      const confirmed = vi.fn();
      await action({
        tezos,
        orderbookContractAddress: "book",
        orderId: "9007199254740993",
        orderType: "BUY",
        onTransactionConfirmed: confirmed,
      });
      expect(toolkit.wallet.batch).toHaveBeenCalledWith(
        toolkit.estimate.batch.mock.calls[0][0]
      );
      expect(send).toHaveBeenCalledOnce();
      expect(confirmed).toHaveBeenCalledWith({ level: 42 });
    }
  );
  it.each([orderbookCancelBatch, orderbookRefundBatch])(
    "builds exact management IDs without signing",
    async (builder) => {
      const { tezos, transfer, send } = setup();
      await builder({
        tezos,
        orderbookContractAddress: "book",
        orderId: "9007199254740993",
        orderType: "SELL",
      });
      expect(transfer).toHaveBeenCalledWith([
        { orderId: "9007199254740993", orderType: "SELL" },
      ]);
      expect(send).not.toHaveBeenCalled();
    }
  );
  it.each(["insufficient", "unknown", "estimate", "wallet", "chain", "stale"])(
    "blocks %s before send",
    async (failure) => {
      const { tezos, toolkit, send } = setup(
        failure === "insufficient" ? "1199" : "1200"
      );
      if (failure === "unknown")
        toolkit.rpc.getBalance.mockRejectedValue(new Error("offline"));
      if (failure === "estimate")
        toolkit.estimate.batch.mockRejectedValue(
          new Error("simulation failed")
        );
      if (failure === "wallet") toolkit.wallet.pkh.mockResolvedValueOnce("old");
      if (failure === "chain")
        toolkit.rpc.getChainId.mockResolvedValueOnce("old");
      await expect(
        orderbookCancelOrder({
          tezos,
          orderbookContractAddress: "book",
          orderId: "1",
          orderType: "BUY",
          beforeSubmit: () => {
            if (failure === "stale") throw new Error("changed");
          },
        })
      ).rejects.toThrow();
      expect(send).not.toHaveBeenCalled();
    }
  );
  it.each([orderbookBuy, orderbookSell])(
    "direct trade succeeds without relay or Credits dependencies",
    async (action) => {
      const { tezos, send } = setup();
      await action({
        tezos,
        orderbookContractAddress: "book",
        quoteTokenAddress: "quote",
        quoteTokenId: "0",
        rwaTokenAddress: "base",
        rwaTokenId: "0",
        rwaTokenAmount: "10",
        pricePerRwaToken: "10",
        currency: "USDT",
        orderExpiry: null,
        isMarketOrder: true,
        quantityTickSizeAtoms: "1",
      });
      expect(send).toHaveBeenCalledOnce();
    }
  );
});
