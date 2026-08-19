import type { ReactNode } from "react";

import type { TransferHistoryItemType } from "~/lib/apis/rwa/orders/orders.types";
import { toTokenSlug } from "~/lib/assets";
import Money from "~/lib/atoms/Money";
import { RButton } from "~/lib/atoms/RButton";
import { RIcon } from "~/lib/atoms/RIcon";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";
import { useAssetMetadata } from "~/lib/metadata";
import CustomPopup from "~/lib/organisms/CustomPopup/CustomPopup";
import { OperationHash } from "~/routes/portfolio.activity/components/TransactionHistoryTab/OperationHash";
import { formatOrderDate } from "~/routes/trade.$address/components/AssetTabs/OpenOrdersTab/OrderItem";
import { AssetIcon } from "~/templates/AssetIcon";

import { RTransferTypeIcon } from "./RTransferTypeIcon";
import styles from "./DepositDetailsModal.module.css";

type DepositDetailsModalProps = {
  deposit: TransferHistoryItemType;
  isOpen: boolean;
  onClose: () => void;
};

export function DepositDetailsModal({
  deposit,
  isOpen,
  onClose,
}: DepositDetailsModalProps) {
  const assetSlug = toTokenSlug(deposit.token_address);
  const metadata = useAssetMetadata(assetSlug);
  const assetSymbol = metadata.symbol || "-";
  const isDeposit = deposit.type === "deposit";

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
            <span className={styles.statusBadge}>
              <RText className={styles.statusText} size="body-s">
                {deposit.status || "CONFIRMED"}
              </RText>
            </span>
          </Detail>
          <Detail label="Date">
            {formatOrderDate(deposit.datetime) || "-"}
          </Detail>
          <Detail label="Source">-</Detail>
          <Detail label="Action">
            <span
              className={isDeposit ? styles.depositType : styles.withdrawalType}
            >
              <RTransferTypeIcon
                aria-hidden="true"
                className={styles.typeIcon}
                type={deposit.type}
              />
              {isDeposit ? "Deposit" : "Withdrawal"}
            </span>
          </Detail>
          <Detail label="Assets">
            <span className={styles.assetValue}>
              <AssetIcon
                assetSlug={assetSlug}
                className={styles.assetIcon}
                size={20}
              />
              {assetSymbol}
            </span>
          </Detail>
          <Detail label="Amount">
            {deposit.total === null ? (
              "-"
            ) : (
              <>
                $
                <Money fiat tooltip={false}>
                  {deposit.total}
                </Money>
              </>
            )}
          </Detail>
          <Detail label="Network Commission">-</Detail>
          <Detail label="Sender">-</Detail>
          <Detail label="TxID">
            <OperationHash operationHash={deposit.operation_hash} />
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
