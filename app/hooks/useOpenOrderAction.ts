import { useCallback, useEffect, useMemo, useState } from "react";

import type { OpenOrderItemType } from "~/lib/apis/rwa/orders/orders.types";
import type { RIconName } from "~/lib/atoms/RIcon";
import { useContractAction } from "~/contracts/hooks/useContractAction";
import {
  orderbookCancelOrder,
  orderbookProcessRefund,
} from "~/contracts/orderbook.contract";
import { STATUS_ERROR, STATUS_SUCCESS } from "~/lib/ui/use-status-flag";

type UseOpenOrderActionOptions = {
  assetSymbol: string;
  onAfterAction?: () => Promise<unknown> | void;
  order: OpenOrderItemType;
};

function getContractOrderType(side: string) {
  return side.toLowerCase().includes("buy") ? "BUY" : "SELL";
}

export function useOpenOrderAction({
  assetSymbol,
  onAfterAction,
  order,
}: UseOpenOrderActionOptions) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const contractActionArgs = useMemo(
    () => ({
      orderbookContractAddress: order.orderbook_address,
      orderId: order.order_id,
      orderType: getContractOrderType(order.side),
    }),
    [order.order_id, order.orderbook_address, order.side]
  );

  const handleAfterAction = useCallback(() => {
    setIsPopupOpen(false);
    void onAfterAction?.();
  }, [onAfterAction]);

  const { invokeAction: invokeCancelOrder, status: cancelStatus } =
    useContractAction(
      orderbookCancelOrder,
      contractActionArgs,
      undefined,
      {
        success: {
          title: "Order Canceled",
          message:
            "Your order has been successfully canceled. No funds were used or deducted.",
        },
      },
      { onSuccess: handleAfterAction }
    );
  const { invokeAction: invokeRefundOrder, status: refundStatus } =
    useContractAction(
      orderbookProcessRefund,
      contractActionArgs,
      undefined,
      {
        success: {
          title: "Refund Claimed",
          message: "Your refundable order remainder has been claimed.",
        },
      },
      { onSuccess: handleAfterAction }
    );

  const isRefundAction = !order.can_cancel;
  const activeActionStatus = isRefundAction ? refundStatus : cancelStatus;

  useEffect(() => {
    if (
      activeActionStatus === STATUS_SUCCESS ||
      activeActionStatus === STATUS_ERROR
    ) {
      setIsPopupOpen(false);
    }
  }, [activeActionStatus]);

  const handleOrderAction = async () => {
    if (isRefundAction) {
      await invokeRefundOrder();
      return;
    }

    await invokeCancelOrder();
  };

  return {
    actionIcon: (isRefundAction ? "refund" : "trash") as RIconName,
    actionLabel: isRefundAction
      ? `Request refund for ${assetSymbol} order`
      : `Cancel ${assetSymbol} order`,
    handleClosePopup: () => setIsPopupOpen(false),
    handleOpenPopup: () => setIsPopupOpen(true),
    handleOrderAction,
    isPopupOpen,
    popupDescription: isRefundAction
      ? "Claim the unrefunded remainder from this closed order."
      : "Are you sure you want to cancel your order?",
    popupSubmitLabel: isRefundAction ? "Claim Refund" : "Cancel Order",
    popupTitle: isRefundAction ? "Confirm Refund" : "Confirm Cancellation",
  };
}
