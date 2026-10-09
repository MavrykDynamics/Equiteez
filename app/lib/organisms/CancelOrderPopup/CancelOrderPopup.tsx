import CloseIcon from "app/icons/cross.svg?react";
import type { ReactNode } from "react";

import type { OpenOrderItemType } from "~/lib/apis/rwa/orders/orders.types";
import Money from "~/lib/atoms/Money";
import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";
import CustomPopup from "~/lib/organisms/CustomPopup/CustomPopup";
import { formatDate } from "~/lib/utils/date";

import styles from "./styles.module.css";

type CancelOrderPopupProps = {
  assetSymbol: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => Promise<void>;
  order: OpenOrderItemType;
  submitLabel?: string;
  title?: string;
};

function getOrderDetails(side: string) {
  const [orderType = "", orderSide = ""] = side.toLowerCase().split("_");
  const normalizedSide = orderSide || orderType;
  const normalizedType = orderSide ? orderType : "limit";

  return {
    side: normalizedSide
      ? `${normalizedSide[0].toUpperCase()}${normalizedSide.slice(1)}`
      : "NA",
    type: `${normalizedType[0].toUpperCase()}${normalizedType.slice(1)}`,
  };
}

export function CancelOrderPopup({
  assetSymbol,
  description = "Are you sure you want to cancel your order?",
  isOpen,
  onClose,
  onSubmit,
  order,
  submitLabel = "Cancel Order",
  title = "Cancel Open Order",
}: CancelOrderPopupProps) {
  const orderDetails = getOrderDetails(order.side);
  const isBuyOrder = orderDetails.side.toLowerCase() === "buy";

  return (
    <CustomPopup
      isOpen={isOpen}
      contentPosition="center"
      className={styles.popupWrapper}
    >
      <div className={styles.closeRow}>
        <button
          aria-label="Close dialog"
          className={styles.closeButton}
          onClick={onClose}
          type="button"
        >
          <CloseIcon aria-hidden className={styles.closeIcon} />
        </button>
      </div>
      <div className={styles.contentWrapper}>
        <div className={styles.mainContent}>
          <div className={styles.heading}>
            <RHeading size="h6" weight="medium">
              {title}
            </RHeading>
            <RText color="neutral-700" size="body-sm">
              {description}
            </RText>
          </div>
          <div className={styles.orderDetails}>
            <DetailRow
              label="Created"
              value={formatDate(order.created_at, true)}
            />
            <div className={styles.detailRow}>
              <RText color="neutral-700" size="body-sm">
                Order Type
              </RText>
              <span
                className={
                  isBuyOrder ? styles.buyOrderType : styles.sellOrderType
                }
              >
                {isBuyOrder ? "+" : "-"}{" "}
                <RText size="body-sm" color={isBuyOrder ? "green-500": "red-500"}>
                  {orderDetails.type} {orderDetails.side}
                </RText>
              </span>
            </div>
            <DetailRow label="Asset" value={assetSymbol} />
            <DetailRow
              label="Price"
              value={
                order.quote_token.price_per_token === null ? (
                  "—"
                ) : (
                  <>
                    $
                    <Money fiat tooltip={false}>
                      {order.quote_token.price_per_token}
                    </Money>
                  </>
                )
              }
            />
            <DetailRow
              label="Amount"
              value={
                <Money fiat tooltip={false}>
                  {order.amount}
                </Money>
              }
            />
            <DetailRow
              label="Total"
              value={
                order.quote_token.total === null ? (
                  "—"
                ) : (
                  <>
                    <Money fiat tooltip={false}>
                      {order.quote_token.total}
                    </Money>{" "}
                    USDT
                  </>
                )
              }
            />
          </div>
        </div>
        <div aria-hidden className={styles.divider} />
        <div className={styles.btnWrapper}>
          <RButton
            className={styles.actionButton}
            onClick={onClose}
            size="medium"
            tone="black"
            variant="secondary"
          >
            Keep Order
          </RButton>
          <RButton
            className={styles.actionButton}
            onClick={onSubmit}
            size="medium"
            tone="black"
          >
            {submitLabel}
          </RButton>
        </div>
      </div>
    </CustomPopup>
  );
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className={styles.detailRow}>
      <RText color="neutral-700" size="body-sm">
        {label}
      </RText>
      <RText size="body-sm">{value}</RText>
    </div>
  );
}
