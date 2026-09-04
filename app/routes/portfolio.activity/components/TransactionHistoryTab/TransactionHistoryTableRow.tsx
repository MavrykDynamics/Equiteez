import { useState } from "react";
import type { OrderHistoryItemType } from "~/lib/apis/rwa/orders/orders.types";
import Money from "~/lib/atoms/Money";
import { RText } from "~/lib/atoms/RTypography/RText";
import {
  formatOrderDate,
  getOrderDetails,
} from "~/routes/trade.$address/components/AssetTabs/OpenOrdersTab/OrderItem";
import { ROrderStatusBadge } from "~/routes/trade.$address/components/AssetTabs/OrderHistoryTab/ROrderStatusBadge";

import { OperationHash } from "./OperationHash";
import { TransactionDetailsModal } from "./TransactionDetailsModal";
import styles from "./styles.module.css";
import { toTokenSlug } from "~/lib/assets";
import { AssetIcon } from "~/templates/AssetIcon";
import { useAssetMetadata } from "~/lib/metadata";

type TransactionHistoryTableRowProps = {
  transaction: OrderHistoryItemType;
};

export function TransactionHistoryTableRow({
  transaction,
}: TransactionHistoryTableRowProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [formattedDate, formattedTime = ""] = formatOrderDate(
    transaction.datetime
  ).split(", ");

  const assetSlug = toTokenSlug(transaction.token_address);
  const metadata = useAssetMetadata(assetSlug);

  const assetSymbol = metadata.symbol;
  const assetName = metadata.name;
  const orderDetails = getOrderDetails(transaction.type);
  const isBuyOrder = orderDetails.side.toLowerCase() === "buy";
  const interaction = `${assetSymbol}/USDT`;

  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- Pointer-only transaction row is a product requirement. */}
      <div className={styles.row} onClick={() => setIsDetailsOpen(true)}>
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
          <div className={styles.asset}>
            <AssetIcon
              size={30}
              assetSlug={assetSlug}
              className={styles.assetIcon}
            />
            <div className={styles.assetIdentity}>
              <RText size="body-sm">
                {assetSymbol}
              </RText>
              <RText color="neutral-700" size="body-s">
                {assetName}
              </RText>
            </div>
          </div>
        </div>
        <div className={styles.cell} role="cell">
          <span className={isBuyOrder ? styles.buy : styles.sell}>
            {isBuyOrder ? "+" : "-"}
            <RText className={styles.typeLabel} size="body-sm">
              {orderDetails.side}
            </RText>
          </span>
        </div>
        <div className={styles.cell} role="cell">
          <div className={styles.amount}>
            <RText size="body-sm" weight="medium">
              $
              <Money fiat tooltip={false}>
                {transaction.total}
              </Money>
            </RText>
            <RText color="neutral-700" size="body-s">
              <Money tooltip={false}>{transaction.amount}</Money> {assetSymbol}
            </RText>
          </div>
        </div>
        <div className={styles.cell} role="cell">
          <RText size="body-sm">{interaction}</RText>
        </div>
        <div className={styles.cell} role="cell">
          <OperationHash operationHash={transaction.operation_hash} />
        </div>
        <div className={styles.cell} role="cell">
          <ROrderStatusBadge status={transaction.status} />
        </div>
      </div>
      <TransactionDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        transaction={transaction}
      />
    </>
  );
}
