import type { OpenOrderItemType } from "~/lib/apis/rwa/orders/orders.types";
import Money from "~/lib/atoms/Money";
import { RIcon } from "~/lib/atoms/RIcon";
import { RText } from "~/lib/atoms/RTypography/RText";
import { RTooltip } from "~/lib/atoms/RTooltip";
import { useOpenOrderAction } from "~/hooks/useOpenOrderAction";
import {
  formatOrderDate,
  getOrderDetails,
  renderNullableFiatValue,
} from "~/routes/trade.$address/components/AssetTabs/OpenOrdersTab/OrderItem";

import { FilledProgress } from "./FilledProgress";
import expiredIcon from "./RExpiredIcon.svg";
import styles from "./styles.module.css";
import { CancelOrderPopup } from "~/routes/wallet.orders/components/CancelOrderPopup/CancelOrderPopup";
import { toTokenSlug } from "~/lib/assets";
import { useAssetMetadata } from "~/lib/metadata";

type OpenOrdersTableRowProps = {
  order: OpenOrderItemType;
};

export function OpenOrdersTableRow({
  order,
}: OpenOrdersTableRowProps) {
  const [formattedDate, formattedTime = ""] = formatOrderDate(
    order.created_at
  ).split(", ");
  const orderDetails = getOrderDetails(order.side);
  const isBuyOrder = orderDetails.side.toLowerCase() === "buy";
  const { expiresLabel, isExpired } = getExpiresLabel(order.expires_at);

  const assetSlug = toTokenSlug(order.token_address);
  const metadata = useAssetMetadata(assetSlug);
  const assetSymbol = metadata.symbol;

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
  } = useOpenOrderAction({ assetSymbol, order });

  return (
    <>
      <div className={styles.row} role="row">
        <div className={styles.cell} role="cell">
          <div className={styles.date}>
            <RText size="body-sm">
              {formattedDate}
            </RText>
            <RText color="neutral-700" size="body-s">
              {formattedTime}
            </RText>
          </div>
        </div>
        <div className={styles.cell} role="cell">
          <RText size="body-sm">{assetSymbol}</RText>
        </div>
        <div className={styles.cell} role="cell">
          <span className={isBuyOrder ? styles.buy : styles.sell}>
            {isBuyOrder ? "+" : "-"}
            <RText className={styles.typeLabel} size="body-sm">
              {orderDetails.type.replace(" Order", "")} {orderDetails.side}
            </RText>
          </span>
        </div>
        <div className={styles.cell} role="cell">
          <RText size="body-sm">
            {renderNullableFiatValue( order.price_per_token, "", "$",)}
          </RText>
        </div>
        <div className={styles.cell} role="cell">
          <RText size="body-sm" weight="medium">
            <Money tooltip={false}>{order.amount}</Money>
          </RText>
        </div>
        <div className={styles.cell} role="cell">
          <FilledProgress order={order} />
        </div>
        <div
          className={`${styles.cell} ${isExpired ? styles.expiredCell : ""}`}
          role="cell"
        >
          <RText size="body-sm">{expiresLabel}</RText>
          {isExpired ? (
            <RTooltip content="Your order has expired. You can claim the remaining escrow with no cancellation fee.">
              <img alt="" className={styles.expiredIcon} src={expiredIcon} />
            </RTooltip>
          ) : null}
        </div>
        <div className={styles.cell} role="cell">
          <RText size="body-sm">
            {renderNullableFiatValue(order.quote_token.total, "USDT")}
          </RText>
        </div>
        <div className={`${styles.cell} ${styles.actionCell}`} role="cell">
          <RTooltip content={actionIcon === "refund" ? "Claim remaining escrow" : "Cancel Order. A cancellation fee will apply"}>
            <button
              aria-label={actionLabel}
              className={styles.actionIcon}
              onClick={handleOpenPopup}
              type="button"
            >
              <RIcon name={actionIcon} size="medium" />
            </button>
          </RTooltip>
        </div>
      </div>

      <CancelOrderPopup
        description={popupDescription}
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        onSubmit={handleOrderAction}
        submitLabel={popupSubmitLabel}
        title={popupTitle}
      />
    </>
  );
}

function getExpiresLabel(expiresAt: string | null) {
  if (!expiresAt) {
    return { expiresLabel: "-", isExpired: false };
  }

  const millisecondsUntilExpiry = new Date(expiresAt).getTime() - Date.now();

  if (Number.isNaN(millisecondsUntilExpiry)) {
    return { expiresLabel: "-", isExpired: false };
  }

  if (millisecondsUntilExpiry <= 0) {
    return { expiresLabel: "Expired", isExpired: true };
  }

  const millisecondsInHour = 60 * 60 * 1000;

  if (millisecondsUntilExpiry < millisecondsInHour) {
    return { expiresLabel: "in <1 hour", isExpired: false };
  }

  const hoursUntilExpiry = Math.ceil(millisecondsUntilExpiry / millisecondsInHour);

  if (hoursUntilExpiry > 23) {
    const daysUntilExpiry = Math.ceil(hoursUntilExpiry / 24);
    return { expiresLabel: `in ${daysUntilExpiry} days`, isExpired: false };
  }

  return { expiresLabel: `in ${hoursUntilExpiry} hours`, isExpired: false };
}
