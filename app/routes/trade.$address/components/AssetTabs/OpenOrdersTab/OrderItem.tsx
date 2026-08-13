import type { OpenOrderItemType } from "~/lib/apis/rwa/orders/orders.types";
import { RIcon } from "~/lib/atoms/RIcon";
import { RText } from "~/lib/atoms/RTypography/RText";
import { formatDate } from "~/lib/utils/date";
import { useOpenOrderAction } from "~/hooks/useOpenOrderAction";
import { CancelOrderPopup } from "~/routes/wallet.orders/components/CancelOrderPopup/CancelOrderPopup";
import Money from "~/lib/atoms/Money";

import styles from "./styles.module.css";

type OrderItemProps = {
  assetSymbol: string;
  onAfterAction: () => Promise<void>;
  order: OpenOrderItemType;
};

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

export function OrderItem({
  assetSymbol,
  onAfterAction,
  order,
}: OrderItemProps) {
  const orderDetails = getOrderDetails(order.side);
  const {
    actionIcon,
    actionLabel,
    handleClosePopup,
    handleOpenPopup,
    handleOrderAction,
    isPopupOpen,
    popupDescription,
    popupSubmitLabel,
    popupTitle,
  } = useOpenOrderAction({ assetSymbol, onAfterAction, order });

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
            <Money fiat>{order.quote_token.price_per_token}</Money>
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
            <Money fiat>{order.quote_token.total}</Money> USDT
          </RText>
        </td>
        <td className={styles.actions} data-label="Actions">
          <button
            aria-label={actionLabel}
            className={styles.actionsButton}
            type="button"
            onClick={handleOpenPopup}
          >
            <RIcon name={actionIcon} size="medium" />
          </button>
        </td>
      </tr>

      <CancelOrderPopup
        onClose={handleClosePopup}
        isOpen={isPopupOpen}
        onSubmit={handleOrderAction}
        title={popupTitle}
        description={popupDescription}
        submitLabel={popupSubmitLabel}
      />
    </>
  );
}
