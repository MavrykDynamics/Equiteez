import { useEffect, useMemo, useState } from "react";

import type { OpenOrderItemType } from "~/lib/apis/rwa/orders/orders.types";
import { RIcon } from "~/lib/atoms/RIcon";
import { RText } from "~/lib/atoms/RTypography/RText";
import { useContractAction } from "~/contracts/hooks/useContractAction";
import {
  orderbookCancelOrder,
  orderbookProcessRefund,
} from "~/contracts/orderbook.contract";
import { formatDate } from "~/lib/utils/date";
import { STATUS_ERROR, STATUS_SUCCESS } from "~/lib/ui/use-status-flag";
import { CancelOrderPopup } from "~/routes/wallet.orders/components/CancelOrderPopup/CancelOrderPopup";
import Money from "~/lib/atoms/Money";

import styles from "./styles.module.css";

type OrderItemProps = {
  assetSymbol: string;
  onAfterAction: () => Promise<void>;
  order: OpenOrderItemType;
};

export function renderNullableFiatValue(value: number | null, suffix?: string) {
  if (value === null) {
    return "—";
  }

  return (
    <>
      <Money fiat>{value}</Money>
      {suffix ? ` ${suffix}` : ""}
    </>
  );
}

export function getOrderDetails(side: string) {
  const [orderType = "", orderSide = ""] = side.toLowerCase().split("_");
  const normalizedSide = orderSide || orderType;
  const normalizedType = orderSide ? orderType : "limit";

  return {
    side: normalizedSide
      ? `${normalizedSide[0].toUpperCase()}${normalizedSide.slice(1)}`
      : "NA",
    type: `${normalizedType[0].toUpperCase()}${normalizedType.slice(1)} Order`,
  };
}

export function formatOrderDate(date: string) {
  return formatDate(date, true).replace(/^0/, "");
}

function getContractOrderType(side: string) {
  return side.toLowerCase().includes("buy") ? "BUY" : "SELL";
}

export function OrderItem({
  assetSymbol,
  onAfterAction,
  order,
}: OrderItemProps) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const contractActionArgs = useMemo(
    () => ({
      orderbookContractAddress: order.orderbook_address,
      orderId: order.order_id,
      orderType: getContractOrderType(order.side),
    }),
    [order.order_id, order.orderbook_address, order.side]
  );

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
      {
        onSuccess: () => {
          setIsPopupOpen(false);
          void onAfterAction();
        },
      }
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
      {
        onSuccess: () => {
          setIsPopupOpen(false);
          void onAfterAction();
        },
      }
    );

  const activeActionStatus = order.can_cancel ? cancelStatus : refundStatus;
  const orderDetails = getOrderDetails(order.side);
  const actionIcon = order.can_cancel ? "trash" : "refund";
  const actionLabel = order.can_cancel
    ? `Cancel ${assetSymbol} order`
    : `Request refund for ${assetSymbol} order`;
  const popupTitle = order.can_cancel
    ? "Confirm Cancellation"
    : "Confirm Refund";
  const popupDescription = order.can_cancel
    ? "Are you sure you want to cancel your order?"
    : "Claim the unrefunded remainder from this closed order.";
  const popupSubmitLabel = order.can_cancel ? "Cancel Order" : "Claim Refund";

  useEffect(() => {
    if (
      activeActionStatus === STATUS_SUCCESS ||
      activeActionStatus === STATUS_ERROR
    ) {
      setIsPopupOpen(false);
    }
  }, [activeActionStatus]);

  const handleOrderAction = async () => {
    if (order.can_cancel) {
      await invokeCancelOrder();
      return;
    }

    await invokeRefundOrder();
  };

  return (
    <>
      <tr className={styles.tableRow}>
        <td data-label="Asset">
          <RText size="body-sm">{formatOrderDate(order.created_at)}</RText>
        </td>
        <td data-label="Pair">
          <RText size="body-sm">{assetSymbol}/USDT</RText>
        </td>
        <td data-label="Type">
          <RText size="body-sm">{orderDetails.type}</RText>
        </td>
        <td data-label="Side">
          <RText
            size="body-sm"
            className={
              orderDetails.side.toLowerCase() === "buy"
                ? styles.buySide
                : styles.sellSide
            }
          >
            {orderDetails.side}
          </RText>
        </td>
        <td data-label="Price">
          <RText size="body-sm">
            {renderNullableFiatValue(order.quote_token.price_per_token)}
          </RText>
        </td>
        <td data-label="Amount">
          <RText size="body-sm">
            <Money fiat>{order.amount}</Money>
          </RText>
        </td>
        {/*TODO remove mock data*/}
        <td data-label="Filled">
          <RText size="body-sm">NA</RText>
        </td>
        {/*TODO remove mock data*/}
        <td data-label="Expires">
          <RText size="body-sm">NA</RText>
        </td>
        <td data-label="Total">
          <RText size="body-sm">
            {renderNullableFiatValue(order.quote_token.total, "USDT")}
          </RText>
        </td>
        <td className={styles.actions} data-label="Actions">
          <button
            aria-label={actionLabel}
            className={styles.actionsButton}
            type="button"
            onClick={() => setIsPopupOpen(true)}
          >
            <RIcon name={actionIcon} size="medium" />
          </button>
        </td>
      </tr>

      <CancelOrderPopup
        onClose={() => setIsPopupOpen(false)}
        isOpen={isPopupOpen}
        onSubmit={handleOrderAction}
        title={popupTitle}
        description={popupDescription}
        submitLabel={popupSubmitLabel}
      />
    </>
  );
}
