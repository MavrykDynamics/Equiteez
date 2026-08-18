import { useState } from "react";

import BuyIcon from "app/icons/wallet/buy.svg?react";
import SellIcon from "app/icons/wallet/sell.svg?react";

import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import type { OrderHistoryItemType } from "~/lib/apis/rwa/orders/orders.types";
import Money from "~/lib/atoms/Money";
import { RIcon } from "~/lib/atoms/RIcon";
import { RText } from "~/lib/atoms/RTypography/RText";
import { NEXUS_LINK } from "~/consts";
import {
  formatOrderDate,
  getOrderDetails,
} from "~/routes/trade.$address/components/AssetTabs/OpenOrdersTab/OrderItem";
import { ROrderStatusBadge } from "~/routes/trade.$address/components/AssetTabs/OrderHistoryTab/ROrderStatusBadge";

import { TransactionDetailsModal } from "./TransactionDetailsModal";
import styles from "./styles.module.css";

type TransactionHistoryTableRowProps = {
  asset?: AssetType;
  transaction: OrderHistoryItemType;
};

function getShortHash(hash: string) {
  return `${hash.slice(0, 7)}...${hash.slice(-3)}`;
}

export function TransactionHistoryTableRow({
  asset,
  transaction,
}: TransactionHistoryTableRowProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [formattedDate, formattedTime = ""] = formatOrderDate(
    transaction.datetime
  ).split(", ");
  const orderDetails = getOrderDetails(transaction.type);
  const isBuyOrder = orderDetails.side.toLowerCase() === "buy";
  const assetSymbol = asset?.metadata.symbol ?? transaction.currency;
  const assetName = asset?.metadata.name ?? "Unknown asset";
  const assetImage = asset?.metadata.icon ?? asset?.profile.image_url;
  const interaction = `${assetSymbol}/USDT`;

  const handleCopyHash = () => {
    void navigator.clipboard?.writeText(transaction.operation_hash);
  };

  return (
    <>
      <div
        className={styles.row}
        onClick={() => setIsDetailsOpen(true)}
      >
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
          <div className={styles.asset}>
            {assetImage ? (
              <img alt="" className={styles.assetIcon} src={assetImage} />
            ) : (
              <span aria-hidden className={styles.assetIconFallback} />
            )}
            <div className={styles.assetIdentity}>
              <RText size="body-sm" weight="medium">
                {assetSymbol}
              </RText>
              <RText color="neutral-600" size="body-s">
                {assetName}
              </RText>
            </div>
          </div>
        </div>
        <div className={styles.cell} role="cell">
          <span className={isBuyOrder ? styles.buy : styles.sell}>
            {isBuyOrder ? (
              <BuyIcon aria-hidden className={styles.typeIcon} />
            ) : (
              <SellIcon aria-hidden className={styles.typeIcon} />
            )}
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
            <RText color="neutral-600" size="body-s">
              <Money tooltip={false}>{transaction.amount}</Money> {assetSymbol}
            </RText>
          </div>
        </div>
        <div className={styles.cell} role="cell">
          <RText size="body-sm">{interaction}</RText>
        </div>
        <div className={styles.cell} role="cell">
          <div className={styles.hash}>
            <RText size="body-sm">
              {getShortHash(transaction.operation_hash)}
            </RText>
            <button
              aria-label="Copy transaction hash"
              className={styles.hashButton}
              onClick={(event) => {
                event.stopPropagation();
                handleCopyHash();
              }}
              type="button"
            >
              <RIcon name="copy" size="small" />
            </button>
            <a
              aria-label="View transaction in explorer"
              className={styles.hashButton}
              href={`${NEXUS_LINK}/explorer/operation/${transaction.operation_hash}`}
              onClick={(event) => event.stopPropagation()}
              rel="noreferrer"
              target="_blank"
            >
              <RIcon name="arrow-long-up-right" size="small" />
            </a>
          </div>
        </div>
        <div className={styles.cell} role="cell">
          <ROrderStatusBadge status={transaction.status} />
        </div>
      </div>
      <TransactionDetailsModal
        asset={asset}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        transaction={transaction}
      />
    </>
  );
}
