import { useOrderbookExecution } from "./useOrderbookExecution";
import { useDirectOrderFee } from "./useDirectOrderFee";
import { useCallback, useEffect, useMemo, useState } from "react";

import type { OpenOrderItemType } from "~/lib/apis/rwa/orders/orders.types";
import type { RIconName } from "~/lib/atoms/RIcon";
import type { ContractActionSuccessMetadata } from "~/contracts/actions.type";
import { useContractAction } from "~/contracts/hooks/useContractAction";
import {
  orderbookCancelOrder,
  orderbookCancelBatch,
  orderbookRefundBatch,
  orderbookProcessRefund,
} from "~/contracts/orderbook.contract";
import {
  FreshnessSource,
  useFreshQueryInvalidation,
} from "~/lib/apis/rwa/freshness";
import { STATUS_ERROR, STATUS_SUCCESS } from "~/lib/ui/use-status-flag";

type UseOpenOrderActionOptions = {
  assetSymbol: string;
  onAfterAction?: () => Promise<unknown> | void;
  order: OpenOrderItemType;
};

function getContractOrderType(side: string): "BUY" | "SELL" {
  return side.toLowerCase().includes("buy") ? "BUY" : "SELL";
}

export function useOpenOrderAction({
  assetSymbol,
  onAfterAction,
  order,
}: UseOpenOrderActionOptions) {
  const invalidateFreshQueries = useFreshQueryInvalidation();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const contractActionArgs = useMemo(
    () => ({
      orderbookContractAddress: order.orderbook_address,
      orderId: order.order_id,
      orderType: getContractOrderType(order.side),
    }),
    [order.order_id, order.orderbook_address, order.side]
  );

  const isRefundAction = !order.can_cancel;
  const directFee = useDirectOrderFee(
    JSON.stringify([isRefundAction, contractActionArgs]),
    (tezos) =>
      (isRefundAction ? orderbookRefundBatch : orderbookCancelBatch)({
        ...contractActionArgs,
        tezos,
      }),
    isPopupOpen && (!isRefundAction || order.refund?.status === "claimable")
  );

  const handleAfterAction = useCallback(
    (metadata: ContractActionSuccessMetadata) => {
      setIsPopupOpen(false);
      void Promise.all([
        invalidateFreshQueries("fetchWalletOpenOrders", {
          level: metadata.confirmation?.level,
          source: FreshnessSource.Orderbook,
        }),
        invalidateFreshQueries("fetchWalletActivitySummary", {
          level: metadata.confirmation?.level,
          source: FreshnessSource.Orderbook,
        }),
      ]);
      void onAfterAction?.();
    },
    [invalidateFreshQueries, onAfterAction]
  );

  const { invokeAction: invokeCancelOrder, status: cancelStatus } =
    useContractAction(
      orderbookCancelOrder,
      { ...contractActionArgs, beforeSubmit: directFee.beforeSubmit },
      undefined,
      {
        success: {
          title: "Cancellation Requested",
          message:
            "Your cancellation transaction was confirmed. You'll receive a notification when the order is updated.",
        },
      },
      { onSuccess: handleAfterAction }
    );
  const { invokeAction: invokeRefundOrder, status: refundStatus } =
    useContractAction(
      orderbookProcessRefund,
      { ...contractActionArgs, beforeSubmit: directFee.beforeSubmit },
      undefined,
      {
        success: {
          title: "Refund Request Confirmed",
          message:
            "Your refund transaction was confirmed. You'll receive a notification when the refund is processed.",
        },
      },
      { onSuccess: handleAfterAction }
    );

  const activeActionStatus = isRefundAction ? refundStatus : cancelStatus;

  useEffect(() => {
    if (
      activeActionStatus === STATUS_SUCCESS ||
      activeActionStatus === STATUS_ERROR
    ) {
      setIsPopupOpen(false);
    }
  }, [activeActionStatus]);

  const execution = useOrderbookExecution({
    request: isRefundAction
      ? {
          kind: "process_refund",
          orderbookAddress: order.orderbook_address,
          orders: [contractActionArgs],
        }
      : {
          kind: "cancel_orders",
          orderbookAddress: order.orderbook_address,
          orders: [
            {
              ...contractActionArgs,
              orderbookAddress: order.orderbook_address,
            },
          ],
        },
    validationMessage:
      isRefundAction && order.refund?.status !== "claimable"
        ? "This order has no claimable refund."
        : undefined,
    directReason: directFee.reason,
    invokeDirect: isRefundAction ? invokeRefundOrder : invokeCancelOrder,
    onConfirmed: () => handleAfterAction({ confirmation: null }),
  });
  const handleOrderAction = async () => {
    if (directFee.method === "mvrk" && directFee.reason) {
      directFee.retry();
      return;
    }
    if (directFee.method === "credits") setIsPopupOpen(false);
    await execution.execute();
  };

  return {
    actionIcon: (isRefundAction ? "refund" : "trash") as RIconName,
    actionLabel: isRefundAction
      ? `Request refund for ${assetSymbol} order`
      : `Cancel ${assetSymbol} order`,
    handleClosePopup: () => setIsPopupOpen(false),
    handleOpenPopup: () => setIsPopupOpen(true),
    handleOrderAction,
    isPopupOpen: isPopupOpen && !execution.isBusy,
    popupSubmitDisabled:
      execution.isBusy ||
      (isRefundAction && order.refund?.status !== "claimable") ||
      (directFee.method === "credits"
        ? Boolean(execution.reason)
        : directFee.state.status === "idle" ||
          directFee.state.status === "loading"),
    paymentSettings: directFee.method === "credits",
    popupDescription:
      (isRefundAction && order.refund?.status !== "claimable"
        ? "This order has no claimable refund."
        : undefined) ??
      execution.reason ??
      (directFee.state.status === "ready"
        ? `Payment: MVRK. Estimated network fee: ${directFee.state.fee.networkFee.div(1_000_000).toFixed()} MVRK; storage: ${directFee.state.fee.storageCost.div(1_000_000).toFixed()} MVRK.`
        : isRefundAction
          ? "Claim the unrefunded remainder from this closed order."
          : "Are you sure you want to cancel your order?"),
    popupSubmitLabel:
      directFee.method === "mvrk" && directFee.reason
        ? "Retry verification"
        : isRefundAction
          ? "Claim Refund"
          : "Cancel Order",
    popupTitle: isRefundAction ? "Confirm Refund" : "Cancel Open Order",
  };
}
