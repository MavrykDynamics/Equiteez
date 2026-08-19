import type { OpenOrderItemType } from "~/lib/apis/rwa/orders/orders.types";
import Money from "~/lib/atoms/Money";
import { RIcon } from "~/lib/atoms/RIcon";
import { RText } from "~/lib/atoms/RTypography/RText";
import { useOpenOrderAction } from "~/hooks/useOpenOrderAction";
import {
  formatOrderDate,
  getOrderDetails,
} from "~/routes/trade.$address/components/AssetTabs/OpenOrdersTab/OrderItem";

import { FilledProgress } from "./FilledProgress";
import styles from "./styles.module.css";
import { CancelOrderPopup } from "~/routes/wallet.orders/components/CancelOrderPopup/CancelOrderPopup";
import { toTokenSlug } from "~/lib/assets";
import { useAssetMetadata } from "~/lib/metadata";

type OpenOrdersTableRowProps = {
  onAfterAction: () => Promise<unknown>;
  order: OpenOrderItemType;
};

export function OpenOrdersTableRow({
  onAfterAction,
  order,
}: OpenOrdersTableRowProps) {
  const [formattedDate, formattedTime = ""] = formatOrderDate(
    order.created_at
  ).split(", ");
  const orderDetails = getOrderDetails(order.side);
  const isBuyOrder = orderDetails.side.toLowerCase() === "buy";
  const hoursUntilExpiry = Math.ceil((order.expires_in_seconds ?? 0) / 3600);
  const expiresLabel =
    order.expires_in_seconds === null
      ? "-"
      : hoursUntilExpiry < 1
        ? "in <1 hour"
        : `in ${hoursUntilExpiry} hours`;

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
  } = useOpenOrderAction({ assetSymbol, onAfterAction, order });

  return (
    <>
      <div className={styles.row} role="row">
        <div className={styles.cell} role="cell">
          <div className={styles.date}>
            <RText size="body-sm" weight="medium">
              {formattedDate}
            </RText>
            <RText color="neutral-600" size="body-s">
              {formattedTime}
            </RText>
          </div>
        </div>
        <div className={styles.cell} role="cell">
          <RText size="body-sm">{assetSymbol}/USDT</RText>
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
            <Money tooltip={false}>{order.quote_token.price_per_token}</Money>{" "}
            USDT
          </RText>
        </div>
        <div className={styles.cell} role="cell">
          <RText size="body-sm">
            <Money tooltip={false}>{order.amount}</Money> {assetSymbol}
          </RText>
        </div>
        <div className={styles.cell} role="cell">
          <FilledProgress order={order} />
        </div>
        <div className={styles.cell} role="cell">
          <RText size="body-sm">{expiresLabel}</RText>
        </div>
        <div className={styles.cell} role="cell">
          <RText size="body-sm">
            <Money tooltip={false}>{order.quote_token.total}</Money> USDT
          </RText>
        </div>
        <div className={`${styles.cell} ${styles.actionCell}`} role="cell">
          <button
            aria-label={actionLabel}
            className={styles.actionIcon}
            onClick={handleOpenPopup}
            type="button"
          >
            <RIcon name={actionIcon} size="medium" />
          </button>
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
