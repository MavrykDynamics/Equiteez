import { BigNumber } from "bignumber.js";
import type { PermitRuntime } from "./permit";
import type { OrderPlanRequest } from "~/lib/relay/orderPlan";
import { buildOrderPayload } from "./orderbookPayload";
import { getQuoteValueAtomsForOrder } from "~/lib/orderbook";
import { toNatString } from "~/lib/utils/formaters";
import { fetchWalletOpenOrders } from "~/lib/apis/rwa/orders/orders";

/** Fresh exact token balances and refundable/cancellable rows; no address-only balance aliases. */
export async function validateOrderPlan(
  runtime: PermitRuntime,
  request: OrderPlanRequest
) {
  const scope = JSON.stringify(runtime.getScope());
  const wallet = runtime.getScope().wallet;
  const checked = async <T>(task: Promise<T>) => {
    const result = await task;
    if (JSON.stringify(runtime.getScope()) !== scope)
      throw new Error("Wallet changed during order validation.");
    return result;
  };
  if ("book" in request) {
    const payload = buildOrderPayload(request.order);
    if (payload.orderExpiry && Date.parse(payload.orderExpiry) <= Date.now())
      throw new Error(
        "Order expiry has passed. Select a new expiry and review again."
      );
    const isBuy = request.kind === "place_buy_order";
    const token = await checked(
      runtime.tezos.contract.at(
        isBuy ? request.book.quoteTokenAddress : request.book.baseTokenAddress
      )
    );
    const balance = await checked(
      token.contractViews
        .get_balance({
          owner: wallet,
          token_id: isBuy ? request.book.quoteTokenId : request.book.rwaTokenId,
        })
        .executeView({ viewCaller: wallet })
    );
    const required = isBuy
      ? getQuoteValueAtomsForOrder({
          tokenAmountAtoms: new BigNumber(payload.rwaTokenAmount),
          pricePerTokenAtoms: new BigNumber(payload.pricePerRwaToken),
          baseTokenDecimals: request.order.baseTokenDecimals!,
          roundingMode: BigNumber.ROUND_UP,
        })
      : new BigNumber(payload.rwaTokenAmount);
    if (required.gt(toNatString(balance as string | BigNumber)))
      throw new Error("The order exceeds your current token balance.");
    return;
  }
  const remaining = new Map(
    (request.kind === "cancel_orders" ? request.orders : [request.order]).map(
      (order) => [`${order.orderType}:${order.orderId}`, order]
    )
  );
  for (let page = 1; remaining.size; page++) {
    const result = await checked(
      fetchWalletOpenOrders({ walletAddress: wallet, page, perPage: 100 })
    );
    if (result.page !== page || result.truncated)
      throw new Error(
        "Order reconciliation is incomplete. Refresh before signing."
      );
    for (const row of result.items) {
      const side = row.side.toLowerCase().includes("buy") ? "BUY" : "SELL";
      const key = `${side}:${row.order_id}`;
      if (
        row.orderbook_address !== request.orderbookAddress ||
        !remaining.has(key)
      )
        continue;
      if (
        request.kind === "cancel_orders"
          ? !row.can_cancel
          : row.refund?.status !== "claimable"
      )
        throw new Error(
          "This order is no longer cancellable or its refund is not claimable."
        );
      remaining.delete(key);
    }
    if (page >= result.total_pages && remaining.size)
      throw new Error(
        "The selected order is no longer available. Refresh orders before signing."
      );
  }
}
