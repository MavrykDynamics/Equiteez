import type { ReactNode } from "react";

import BuyIcon from "app/icons/wallet/buy.svg?react";
import SellIcon from "app/icons/wallet/sell.svg?react";

import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import type { OrderHistoryItemType } from "~/lib/apis/rwa/orders/orders.types";
import Money from "~/lib/atoms/Money";
import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";
import CustomPopup from "~/lib/organisms/CustomPopup/CustomPopup";
import {
  formatOrderDate,
  getOrderDetails,
} from "~/routes/trade.$address/components/AssetTabs/OpenOrdersTab/OrderItem";
import { ROrderStatusBadge } from "~/routes/trade.$address/components/AssetTabs/OrderHistoryTab/ROrderStatusBadge";

import { OperationHash } from "./OperationHash";
import styles from "./TransactionDetailsModal.module.css";

type TransactionDetailsModalProps = {
  asset?: AssetType;
  isOpen: boolean;
  onClose: () => void;
  transaction: OrderHistoryItemType;
};

export function TransactionDetailsModal({
  asset,
  isOpen,
  onClose,
  transaction,
}: TransactionDetailsModalProps) {
  const orderDetails = getOrderDetails(transaction.type);
  const assetSymbol = asset?.metadata.symbol ?? transaction.currency;
  const assetImage = asset?.metadata.icon ?? asset?.profile.image_url;
  const isBuyOrder = orderDetails.side.toLowerCase() === "buy";

  return (
    <CustomPopup
      className={styles.modal}
      contentLabel="Transaction details"
      contentPosition="center"
      isOpen={isOpen}
      onRequestClose={onClose}
      overlayClassName={styles.overlay}
    >
      <div className={styles.closeRow}>
        <button
          aria-label="Close transaction details"
          className={styles.closeButton}
          onClick={onClose}
          type="button"
        >
          <RIcon name="close" size="medium" />
        </button>
      </div>

      <div className={styles.content}>
        <RHeading className={styles.title} size="h6" weight="medium">
          Transaction Details
        </RHeading>

        <dl className={styles.details}>
          <Detail label="Status">
            <ROrderStatusBadge status={transaction.status} />
          </Detail>
          <Detail label="Date">{formatOrderDate(transaction.datetime)}</Detail>
          <Detail label="Source">Spot Wallet</Detail>
          <Detail label="Action">
            <span className={isBuyOrder ? styles.buy : styles.sell}>
              {isBuyOrder ? "+" : "-"}
              {orderDetails.side}
            </span>
          </Detail>
          <Detail label="Assets">
            <span className={styles.assetValue}>
              {assetImage ? (
                <img alt="" className={styles.assetIcon} src={assetImage} />
              ) : (
                <span aria-hidden className={styles.assetIconFallback} />
              )}
              {assetSymbol}
            </span>
          </Detail>
          <Detail label="Amount">
            $
            <Money fiat tooltip={false}>
              {transaction.total}
            </Money>
          </Detail>
          <Detail label="Network Commission">—</Detail>
          <Detail label="TxID">
            <OperationHash operationHash={transaction.operation_hash} />
          </Detail>
        </dl>

        <RButton
          className={styles.confirmButton}
          onClick={onClose}
          size="medium"
          tone="black"
        >
          OK
        </RButton>
      </div>
    </CustomPopup>
  );
}

function Detail({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className={styles.detail}>
      <dt>
        <RText color="neutral-700" size="body-sm">
          {label}
        </RText>
      </dt>
      <dd>
        <RText size="body-sm">{children}</RText>
      </dd>
    </div>
  );
}
