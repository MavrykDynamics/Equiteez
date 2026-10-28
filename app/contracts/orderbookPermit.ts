import { UnitValue } from "@mavrykdynamics/taquito-michelson-encoder";
import type { MavrykToolkit } from "@mavrykdynamics/taquito";
import {
  validateAddress,
  ValidationResult,
} from "@mavrykdynamics/taquito-utils";
import type {
  RelayConfig,
  RelayIntent,
} from "~/lib/apis/rwa/relay/relay.types";
import { relayIntentSchema } from "~/lib/apis/rwa/relay/relay.schema";
import type { OrderbookExecutionConfig } from "~/lib/orderbook/orderbookConfig.types";
import { toNatString, toPositiveNatString } from "~/lib/utils/formaters";
import { buildOrderPayload, type OrderPayloadParams } from "./orderbookPayload";

type OrderId = { orderId: string; orderType: "BUY" | "SELL" };
export type PermitRequest =
  | {
      kind: "place_buy_order" | "place_sell_order";
      book: OrderbookExecutionConfig;
      order: OrderPayloadParams;
    }
  | {
      kind: "cancel_orders";
      orderbookAddress: string;
      orders: (OrderId & { orderbookAddress: string })[];
    }
  | { kind: "process_refund"; orderbookAddress: string; order: OrderId }
  | {
      kind: "update_operators";
      book: OrderbookExecutionConfig;
      side: "buy" | "sell";
    }
  | { kind: "fee_top_up"; amountUnits: string };
export type PermitAction = {
  contract: string;
  contractKind: "orderbook" | "quote_token" | "rwa_token";
  variant: string;
  action: Record<string, unknown>;
  intent: RelayIntent | null;
  topUpAmount: string | null;
};

function assertAddress(address: string) {
  if (validateAddress(address) !== ValidationResult.VALID)
    throw new Error("Invalid permit address");
}
export function assertCapability(
  config: RelayConfig,
  address: string,
  kind: PermitAction["contractKind"],
  variant: string
) {
  assertAddress(address);
  if (
    !config.enabled ||
    !config.contracts.some(
      (c) =>
        c.address === address &&
        c.kind === kind &&
        c.permitActions.includes(variant)
    )
  ) {
    throw new Error(
      "Gasless execution is unavailable for this contract and action"
    );
  }
}

export function buildPermitAction(
  request: PermitRequest,
  config: RelayConfig,
  wallet: string
): PermitAction {
  assertAddress(wallet);
  let result: PermitAction;
  if (request.kind === "fee_top_up") {
    const fee = config.fee;
    if (!fee.enabled || fee.entrypoint !== "permitAndExecute")
      throw new Error("Credit top-ups are unavailable");
    assertAddress(fee.collector);
    const amount = toPositiveNatString(request.amountUnits, "Top-up amount");
    if (
      BigInt(amount) < BigInt(fee.topUpMinUnits) ||
      BigInt(amount) > BigInt(fee.topUpMaxUnits)
    )
      throw new Error("Top-up amount is outside the configured bounds");
    result = {
      contract: fee.tokenContract,
      contractKind: "quote_token",
      variant: "permitTransfer",
      intent: null,
      topUpAmount: amount,
      action: {
        permitTransfer: [
          {
            from_: wallet,
            txs: [
              {
                to_: fee.collector,
                token_id: toNatString(fee.tokenId),
                amount,
              },
            ],
          },
        ],
      },
    };
  } else if (request.kind === "update_operators") {
    const { book, side } = request;
    assertCapability(
      config,
      book.address,
      "orderbook",
      side === "buy" ? "permitPlaceBuyOrder" : "permitPlaceSellOrder"
    );
    const token =
      side === "buy" ? book.quoteTokenAddress : book.baseTokenAddress;
    const tokenId = toNatString(
      side === "buy" ? book.quoteTokenId : book.rwaTokenId
    );
    result = {
      contract: token,
      contractKind: side === "buy" ? "quote_token" : "rwa_token",
      variant: "permitUpdateOperators",
      topUpAmount: null,
      intent: {
        kind: request.kind,
        tokenAddress: token,
        tokenId,
        operator: book.address,
        operatorAction: "add_operator",
      },
      action: {
        permitUpdateOperators: [
          {
            add_operator: {
              owner: wallet,
              operator: book.address,
              token_id: tokenId,
            },
          },
        ],
      },
    };
  } else if (
    request.kind === "place_buy_order" ||
    request.kind === "place_sell_order"
  ) {
    const { book } = request;
    const isBuy = request.kind === "place_buy_order";
    // Execution configuration is authoritative for ticks/minimums, as on the direct path.
    if (request.order.currency.trim() !== book.currencyKey)
      throw new Error("Order currency does not match the selected book");
    if (request.order.baseTokenDecimals === undefined)
      throw new Error("Base token decimals are required");
    const payload = buildOrderPayload({
      ...request.order,
      tickSizeAtoms: book.tickSize,
      quantityTickSizeAtoms: book.quantityTickSize,
      minRwaTokenAmount: isBuy
        ? book.minBuyOrderAmount
        : book.minSellOrderAmount,
      minQuoteValue: isBuy ? book.minBuyOrderValue : book.minSellOrderValue,
    });
    const variant = isBuy ? "permitPlaceBuyOrder" : "permitPlaceSellOrder";
    assertCapability(
      config,
      isBuy ? book.quoteTokenAddress : book.baseTokenAddress,
      isBuy ? "quote_token" : "rwa_token",
      "permitUpdateOperators"
    );
    result = {
      contract: book.address,
      contractKind: "orderbook",
      variant,
      action: { [variant]: [payload] },
      intent: {
        kind: request.kind,
        orderbookAddress: book.address,
        ...payload,
      },
      topUpAmount: null,
    };
  } else if (request.kind === "cancel_orders") {
    if (request.orders.length < 1 || request.orders.length > 10)
      throw new Error("Cancel between 1 and 10 orders from the same book");
    const seen = new Set<string>();
    const orders = request.orders.map((order) => {
      if (order.orderbookAddress !== request.orderbookAddress)
        throw new Error("Cancellation orders must belong to the same book");
      const value = {
        orderId: toNatString(order.orderId),
        orderType: order.orderType,
      };
      const key = `${value.orderType}:${value.orderId}`;
      if (seen.has(key)) throw new Error("Duplicate cancellation order");
      seen.add(key);
      return value;
    });
    result = {
      contract: request.orderbookAddress,
      contractKind: "orderbook",
      variant: "permitCancelOrders",
      action: { permitCancelOrders: orders },
      intent: {
        kind: request.kind,
        orderbookAddress: request.orderbookAddress,
        orders,
      },
      topUpAmount: null,
    };
  } else if (request.kind === "process_refund") {
    const order = {
      orderId: toNatString(request.order.orderId),
      orderType: request.order.orderType,
    };
    result = {
      contract: request.orderbookAddress,
      contractKind: "orderbook",
      variant: "permitProcessRefund",
      action: { permitProcessRefund: [order] },
      intent: {
        kind: request.kind,
        orderbookAddress: request.orderbookAddress,
        ...order,
      },
      topUpAmount: null,
    };
  } else {
    throw new Error("Unsupported permit action");
  }
  assertCapability(
    config,
    result.contract,
    result.contractKind,
    result.variant
  );
  if (result.intent) result.intent = relayIntentSchema.parse(result.intent);
  return result;
}

type OperatorKey = { owner: string; operator: string; token_id: string };
export type OperatorState = {
  state: "present" | "absent" | "unreadable";
  needsGrant: boolean;
  diagnostics: string[];
};
/** No permanent cache: direct trading may revoke a previous persistent grant. */
export async function readPermitOperator(
  tezos: MavrykToolkit,
  token: string,
  key: OperatorKey
): Promise<OperatorState> {
  assertAddress(token);
  assertAddress(key.owner);
  assertAddress(key.operator);
  const tokenId = toNatString(key.token_id);
  const diagnostics: string[] = [];
  try {
    const contract = await tezos.contract.at(token);
    try {
      if (!contract.contractViews.is_operator) throw new Error("View missing");
      const value: unknown = await contract.contractViews
        .is_operator({ ...key, token_id: tokenId })
        .executeView({ viewCaller: key.owner });
      if (typeof value !== "boolean") throw new Error("Malformed view result");
      return {
        state: value ? "present" : "absent",
        needsGrant: !value,
        diagnostics,
      };
    } catch {
      diagnostics.push(
        "Operator view unavailable; checked the operators map instead."
      );
    }
    try {
      const storage = await contract.storage<{
        operators?: {
          get(key: { 0: string; 1: string; 2: string }): Promise<unknown>;
        };
      }>();
      if (!storage.operators) throw new Error("Map missing");
      const value = await storage.operators.get({
        0: key.owner,
        1: key.operator,
        2: tokenId,
      });
      // Taquito decodes Michelson unit as its exported UnitValue symbol.
      if (value !== undefined && value !== UnitValue)
        throw new Error("Malformed map value");
      return {
        state: value === undefined ? "absent" : "present",
        needsGrant: value === undefined,
        diagnostics,
      };
    } catch {
      diagnostics.push(
        "Operator map unreadable. A confirmed operator grant is required before trading."
      );
    }
  } catch {
    diagnostics.push(
      "Token contract unreadable. Operator permission could not be confirmed."
    );
  }
  return { state: "unreadable", needsGrant: true, diagnostics };
}
