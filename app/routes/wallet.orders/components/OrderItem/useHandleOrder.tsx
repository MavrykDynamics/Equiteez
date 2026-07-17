import { OrderType } from "~/lib/apis/mbrwa/user/userOrders/orders.types";
import { useMarketsContext } from "~/providers/MarketsProvider/markets.provider";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useContractAction } from "~/contracts/hooks/useContractAction";
import {
  orderbookCancelOrder,
  orderbookProcessRefund,
} from "~/contracts/orderbook.contract";
import { STATUS_ERROR, STATUS_SUCCESS } from "~/lib/ui/use-status-flag";
import { OrderTypes } from "~/lib/apis/mbrwa/user/userOrders/order.const";

export function useHandleOrder(
  order: OrderType,
  handleAfterCancelOrder: () => Promise<void>
) {
  const {
    pickers: { pickOrderbookContract },
  } = useMarketsContext();

  const [isOpenPopup, setIsOpenPopup] = useState(false);

  const handleTogglePopup = useCallback(
    () => setIsOpenPopup((prevState) => !prevState),
    []
  );

  const cancelOrderProps = useMemo(
    () => ({
      orderbookContractAddress:
        order.orderbook_address ?? pickOrderbookContract[order.token.address],
      orderId: order.order_id,
      orderType:
        order.order_type === OrderTypes.LIMIT_BUY ||
        order.order_type === OrderTypes.MARKET_BUY
          ? "BUY"
          : "SELL",
    }),
    [
      order.order_id,
      order.order_type,
      order.orderbook_address,
      order.token.address,
      pickOrderbookContract,
    ]
  );
  const refundOrderProps = cancelOrderProps;

  const cancelToastProps = useMemo(
    () => ({
      success: {
        title: "Order Canceled",
        message:
          "Your order has been successfully canceled. No funds were used or deducted.",
      },
    }),
    []
  );
  const refundToastProps = useMemo(
    () => ({
      success: {
        title: "Refund Claimed",
        message: "Your refundable order remainder has been claimed.",
      },
    }),
    []
  );

  const { invokeAction: handleCancelOrder, status: cancelStatus } =
    useContractAction(
      orderbookCancelOrder,
      cancelOrderProps,
      undefined,
      cancelToastProps
    );
  const { invokeAction: handleRefundOrder, status: refundStatus } =
    useContractAction(
      orderbookProcessRefund,
      refundOrderProps,
      undefined,
      refundToastProps
    );

  const isRefundAction = order.canRefund;
  const status = isRefundAction ? refundStatus : cancelStatus;
  const handleOrderAction = isRefundAction
    ? handleRefundOrder
    : handleCancelOrder;

  useEffect(() => {
    if (status === STATUS_SUCCESS) {
      handleTogglePopup();
      handleAfterCancelOrder();
    }
    if (status === STATUS_ERROR) handleTogglePopup();
  }, [handleAfterCancelOrder, handleTogglePopup, status]);

  return {
    actionLabel: isRefundAction ? "claim" : "cancel",
    handleOrderAction,
    handleTogglePopup,
    isOpenPopup,
    popupSubmitLabel: isRefundAction ? "Claim Refund" : "Cancel Order",
    popupTitle: isRefundAction ? "Confirm Refund" : "Confirm Cancellation",
    popupDescription: isRefundAction
      ? "Claim the unrefunded remainder from this closed order."
      : "Are you sure you want to cancel your order?",
  };
}
