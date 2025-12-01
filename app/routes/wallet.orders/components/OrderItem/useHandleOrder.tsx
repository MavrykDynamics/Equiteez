import { OrderType } from "~/lib/apis/mbrwa/user/userOrders/orders.types";
import { useMarketsContext } from "~/providers/MarketsProvider/markets.provider";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useContractAction } from "~/contracts/hooks/useContractAction";
import { orderbookCancelOrder } from "~/contracts/orderbook.contract";
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
      orderbookContractAddress: pickOrderbookContract[order.token.address],
      orderId: order.order_id,
      orderType:
        order.order_type === OrderTypes.LIMIT_BUY ||
        order.order_type === OrderTypes.MARKET_BUY
          ? "BUY"
          : "SELL",
    }),
    [order.id, order.order_type, order.token.address, pickOrderbookContract]
  );

  const contractActionToastProps = useMemo(
    () => ({
      success: {
        title: "Order Canceled",
        message:
          "Your order has been successfully canceled. No funds were used or deducted.",
      },
    }),
    []
  );

  const { invokeAction: handleCancelOrder, status } = useContractAction(
    orderbookCancelOrder,
    cancelOrderProps,
    undefined
    // contractActionToastProps //TODO add toastMessages
  );

  useEffect(() => {
    if (status === STATUS_SUCCESS) {
      handleTogglePopup();
      handleAfterCancelOrder();
    }
    if (status === STATUS_ERROR) handleTogglePopup();
  }, [handleAfterCancelOrder, handleTogglePopup, status]);

  return {
    handleCancelOrder,
    handleTogglePopup,
    isOpenPopup,
  };
}
