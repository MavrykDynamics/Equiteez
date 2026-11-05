import { describe, expect, it, vi } from "vitest";
import type { MavrykToolkit } from "@mavrykdynamics/taquito";
import { Schema, UnitValue } from "@mavrykdynamics/taquito-michelson-encoder";
import configFile from "../../docs/fixtures/permit-deployment/relay-config.json";
import orderScript from "../../docs/fixtures/permit-deployment/orderbook-script.json";
import quoteScript from "../../docs/fixtures/permit-deployment/quote_token-script.json";
import vectors from "../../docs/fixtures/permit-deployment/signature-vectors.json";
import { relayConfigSchema } from "~/lib/apis/rwa/relay/relay.schema";
import {
  buildPermitAction,
  readPermitOperator,
  type PermitRequest,
} from "./orderbookPermit";
import { findAnnotation, encodePermit } from "./permitCodec";

const config = relayConfigSchema.parse(configFile);
const vector = vectors.vectors[0];
const book = {
  address: "KT19ACYQCndgTJTaD2hTvpkBmmyEDxq7fZjM",
  baseTokenAddress: "KT1XbAtSp5i1GJZTHzjc5J8SYkcEE8kqtkSv",
  rwaTokenId: "0",
  quoteTokenAddress: vector.contract,
  quoteTokenId: "0",
  currencyKey: "USDT",
  tickSize: "100000",
  quantityTickSize: "10000",
  minBuyOrderAmount: "1",
  minBuyOrderValue: "1",
  minSellOrderAmount: "1",
  minSellOrderValue: "1",
};
const order = {
  rwaTokenAmount: "90071992547409930000",
  pricePerRwaToken: "100000",
  currency: "USDT",
  orderExpiry: null,
  isMarketOrder: false,
  baseTokenDecimals: 6,
};
const build = (request: PermitRequest) =>
  buildPermitAction(request, config, vector.wallet);

describe("contract-defined permit actions", () => {
  it.each(["place_buy_order", "place_sell_order"] as const)(
    "preserves exact shared order payload for %s",
    (kind) => {
      const result = build({ kind, book, order });
      expect(result.intent).toMatchObject({
        rwaTokenAmount: order.rwaTokenAmount,
        pricePerRwaToken: order.pricePerRwaToken,
      });
      const entry = findAnnotation(
        orderScript.code.find((n) => n.prim === "parameter"),
        "%permitAndExecute"
      );
      const actionType = findAnnotation(entry, "%action");
      const encoded = encodePermit({
        actionType,
        action: result.action,
        chainId: vector.chainId,
        contract: result.contract,
        counter: "90071992547409930",
        deadline: vector.deadline,
      });
      expect(encoded.payload).toMatch(/^05/);
      expect(
        new Schema(actionType)
          .Execute(encoded.actionValue)[0]
          .rwaTokenAmount.toFixed()
      ).toBe(order.rwaTokenAmount);
      expect(() =>
        build({ kind, book, order: { ...order, rwaTokenAmount: "10001" } })
      ).toThrow("Quantity");
      expect(() =>
        build({ kind, book, order: { ...order, pricePerRwaToken: "100001" } })
      ).toThrow("Price");
      expect(() =>
        build({
          kind,
          book,
          order: { ...order, pricePerRwaToken: "100001", isMarketOrder: true },
        })
      ).not.toThrow();
    }
  );
  it.each([1, 10])("builds %i same-book cancellations", (count) => {
    const result = build({
      kind: "cancel_orders",
      orderbookAddress: book.address,
      orders: Array.from({ length: count }, (_, i) => ({
        orderbookAddress: book.address,
        orderId: String(i),
        orderType: "BUY",
      })),
    });
    expect(result.action.permitCancelOrders).toHaveLength(count);
  });
  it.each([0, 11])("rejects %i cancellations", (count) => {
    expect(() =>
      build({
        kind: "cancel_orders",
        orderbookAddress: book.address,
        orders: Array.from({ length: count }, (_, i) => ({
          orderbookAddress: book.address,
          orderId: String(i),
          orderType: "BUY",
        })),
      })
    ).toThrow("1 and 10");
  });
  it("rejects mixed books and duplicate orders", () => {
    const item = {
      orderbookAddress: book.address,
      orderId: "1",
      orderType: "SELL" as const,
    };
    expect(() =>
      build({
        kind: "cancel_orders",
        orderbookAddress: book.address,
        orders: [item, item],
      })
    ).toThrow("Duplicate");
    expect(() =>
      build({
        kind: "cancel_orders",
        orderbookAddress: book.address,
        orders: [{ ...item, orderbookAddress: vector.contract }],
      })
    ).toThrow("same book");
  });
  it("builds refund without operator permissions", () => {
    const result = buildPermitAction(
      {
        kind: "process_refund",
        orderbookAddress: book.address,
        orders: [{ orderId: "90071992547409931", orderType: "SELL" }],
      },
      {
        ...config,
        contracts: config.contracts.filter((c) => c.kind === "orderbook"),
      },
      vector.wallet
    );
    expect(result.action).toEqual({
      permitProcessRefund: [
        { orderId: "90071992547409931", orderType: "SELL" },
      ],
    });
  });
  it("builds one refund action for a list with the same ID on both sides", () => {
    const orders = [
      { orderId: "12", orderType: "BUY" as const },
      { orderId: "12", orderType: "SELL" as const },
    ];
    const result = build({
      kind: "process_refund",
      orderbookAddress: book.address,
      orders,
    });
    expect(result.action).toEqual({ permitProcessRefund: orders });
    expect(result.intent).toEqual({
      kind: "process_refund",
      orderbookAddress: book.address,
      orders,
    });
  });
  it("rejects duplicate or empty refund lists", () => {
    const order = { orderId: "12", orderType: "BUY" as const };
    expect(() =>
      build({
        kind: "process_refund",
        orderbookAddress: book.address,
        orders: [order, order],
      })
    ).toThrow("Duplicate");
    expect(() =>
      build({
        kind: "process_refund",
        orderbookAddress: book.address,
        orders: [],
      })
    ).toThrow("between 1 and 100");
  });
  it.each(["buy", "sell"] as const)(
    "grants only the selected token/book for %s",
    (side) => {
      const result = build({ kind: "update_operators", book, side });
      expect(result.action).toEqual({
        permitUpdateOperators: [
          {
            add_operator: {
              owner: vector.wallet,
              operator: book.address,
              token_id: "0",
            },
          },
        ],
      });
      expect(result.contract).toBe(
        side === "buy" ? book.quoteTokenAddress : book.baseTokenAddress
      );
    }
  );
  it("constructs top-up only to the configured collector and token ID", () => {
    const result = build({ kind: "fee_top_up", amountUnits: "5000000" });
    if (!config.fee.enabled) throw new Error("Fixture must have fees enabled");
    expect(result.action).toEqual({
      permitTransfer: [
        {
          from_: vector.wallet,
          txs: [
            { to_: config.fee.collector, token_id: "0", amount: "5000000" },
          ],
        },
      ],
    });
    const actionType = findAnnotation(
      findAnnotation(
        quoteScript.code.find((n) => n.prim === "parameter"),
        "%permitAndExecute"
      ),
      "%action"
    );
    expect(() =>
      encodePermit({
        actionType,
        action: result.action,
        chainId: vector.chainId,
        contract: result.contract,
        counter: "0",
        deadline: vector.deadline,
      })
    ).not.toThrow();
  });
  it.each(["0", "4999999", "100000001", "-1", "1.5"])(
    "rejects invalid top-up %s",
    (amountUnits) =>
      expect(() => build({ kind: "fee_top_up", amountUnits })).toThrow()
  );
  it("rejects fee-off and missing capabilities", () => {
    expect(() =>
      buildPermitAction(
        { kind: "fee_top_up", amountUnits: "5000000" },
        { ...config, fee: { enabled: false } },
        vector.wallet
      )
    ).toThrow("unavailable");
    expect(() =>
      buildPermitAction(
        { kind: "update_operators", book, side: "buy" },
        { ...config, contracts: [] },
        vector.wallet
      )
    ).toThrow("CONTRACT_NOT_RELAYABLE");
  });
});

describe("conservative operator reads", () => {
  const key = { owner: vector.wallet, operator: book.address, token_id: "0" };
  function fixture() {
    const view = vi.fn().mockResolvedValue(true);
    const get = vi.fn().mockResolvedValue(UnitValue);
    const tezos = {
      contract: {
        at: vi.fn().mockResolvedValue({
          contractViews: { is_operator: () => ({ executeView: view }) },
          storage: vi.fn().mockResolvedValue({ operators: { get } }),
        }),
      },
    } as unknown as MavrykToolkit;
    return { tezos, view, get };
  }
  it.each([true, false])("returns known view state %s", async (value) => {
    const f = fixture();
    f.view.mockResolvedValue(value);
    expect(
      await readPermitOperator(f.tezos, vector.contract, key)
    ).toMatchObject({
      state: value ? "present" : "absent",
      needsGrant: !value,
    });
    expect(f.get).not.toHaveBeenCalled();
  });
  it.each([UnitValue, undefined])(
    "falls back to exact map key",
    async (value) => {
      const f = fixture();
      f.view.mockRejectedValue(new Error("unavailable"));
      f.get.mockResolvedValue(value);
      expect(
        await readPermitOperator(f.tezos, vector.contract, key)
      ).toMatchObject({
        state: value === undefined ? "absent" : "present",
        needsGrant: value === undefined,
      });
      expect(f.get).toHaveBeenCalledWith({
        0: key.owner,
        1: key.operator,
        2: "0",
      });
    }
  );
  it("requires a grant with explicit diagnostics for unreadable state", async () => {
    const f = fixture();
    f.view.mockResolvedValue("true");
    f.get.mockRejectedValue(new Error("RPC unavailable"));
    const result = await readPermitOperator(f.tezos, vector.contract, key);
    expect(result.state).toBe("unreadable");
    expect(result.needsGrant).toBe(true);
    expect(result.diagnostics).toHaveLength(2);
  });
});
