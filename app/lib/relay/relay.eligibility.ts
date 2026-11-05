import type { RelayConfigState } from "~/lib/apis/rwa/relay/relay.types";

type OrderAction =
  | "place_buy_order"
  | "place_sell_order"
  | "cancel_orders"
  | "process_refund";
const variants: Record<OrderAction, string> = {
  place_buy_order: "permitPlaceBuyOrder",
  place_sell_order: "permitPlaceSellOrder",
  cancel_orders: "permitCancelOrders",
  process_refund: "permitProcessRefund",
};
export function getRelayEligibility(input: {
  config: RelayConfigState;
  wallet: string | null;
  authenticatedWallet: string | null;
  isAuthLoading: boolean;
  action: OrderAction;
  orderbookAddress: string;
  tokenAddress?: string;
}):
  | { eligible: true }
  | {
      eligible: false;
      reason:
        | "config-loading"
        | "relay-disabled"
        | "sign-in"
        | "unsupported-contract";
    } {
  if (input.config.state === "loading")
    return { eligible: false, reason: "config-loading" };
  if (!input.config.config.enabled)
    return { eligible: false, reason: "relay-disabled" };
  if (
    input.isAuthLoading ||
    !input.wallet ||
    input.wallet !== input.authenticatedWallet
  )
    return { eligible: false, reason: "sign-in" };
  const { contracts } = input.config.config;
  const book = contracts.some(
    (contract) =>
      contract.address === input.orderbookAddress &&
      contract.kind === "orderbook" &&
      contract.permitActions.includes(variants[input.action])
  );
  const needsOperator =
    input.action === "place_buy_order" || input.action === "place_sell_order";
  const tokenKind =
    input.action === "place_buy_order" ? "quote_token" : "rwa_token";
  const token =
    !needsOperator ||
    contracts.some(
      (contract) =>
        contract.address === input.tokenAddress &&
        contract.kind === tokenKind &&
        contract.permitActions.includes("permitUpdateOperators")
    );
  return book && token
    ? { eligible: true }
    : { eligible: false, reason: "unsupported-contract" };
}
