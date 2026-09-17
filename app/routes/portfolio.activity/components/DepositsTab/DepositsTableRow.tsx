import { useState } from "react";

import type { TransferHistoryItemType } from "~/lib/apis/rwa/orders/orders.types";
import { toTokenSlug } from "~/lib/assets";
import Money from "~/lib/atoms/Money";
import { RText } from "~/lib/atoms/RTypography/RText";
import { OperationHash } from "~/routes/portfolio.activity/components/TransactionHistoryTab/OperationHash";
import { formatOrderDate } from "~/routes/trade.$address/components/AssetTabs/OpenOrdersTab/OrderItem";
import { AssetIcon } from "~/templates/AssetIcon";

import { DepositDetailsModal } from "./DepositDetailsModal";
import { RTransferTypeIcon } from "./RTransferTypeIcon";
import styles from "./styles.module.css";
import { useAssetMetadata } from "~/lib/metadata";
import classNames from "clsx";

type DepositsTableRowProps = {
  deposit: TransferHistoryItemType;
};

export function getTypeLabel(row: TransferHistoryItemType): string {
  if (row.type === "deposit" && row.chain_from && row.chain_from !== "mavryk")
    return "Bridge In";
  if (row.type === "withdrawal" && row.chain_to && row.chain_to !== "mavryk")
    return "Bridge Out";
  return row.type === "deposit" ? "Deposit" : "Withdraw";
}

export function DepositsTableRow({ deposit }: DepositsTableRowProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [formattedDate, formattedTime = ""] = formatOrderDate(
    deposit.datetime
  ).split(", ");

  const assetSlug = toTokenSlug(deposit.token_address);
  const metadata = useAssetMetadata(assetSlug);

  const assetSymbol = metadata?.symbol ?? "-";
  const assetName = metadata?.name ?? "Unknown token";
  const isDeposit = deposit.type === "deposit";
  const hasTotalValue = deposit.total !== null;

  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/interactive-supports-focus, jsx-a11y/no-static-element-interactions -- Pointer-only transaction row is a product requirement. */}
      <div
        className={styles.row}
        onClick={() => setIsDetailsOpen(true)}
        role="row"
      >
        <div className={styles.cell} role="cell">
          <div className={styles.date}>
            <RText size="body-sm">{formattedDate}</RText>
            <RText color="neutral-700" size="body-s">
              {formattedTime}
            </RText>
          </div>
        </div>
        <div className={styles.cell} role="cell">
          <div className={styles.asset}>
            <AssetIcon
              assetSlug={assetSlug}
              className={styles.assetIcon}
              size={30}
            />
            <div className={styles.assetIdentity}>
              <RText size="body-sm">{assetSymbol}</RText>
              <RText color="neutral-700" size="body-s">
                {assetName}
              </RText>
            </div>
          </div>
        </div>
        <div className={styles.cell} role="cell">
          <span
            className={isDeposit ? styles.depositType : styles.withdrawalType}
          >
            <RTransferTypeIcon
              aria-hidden="true"
              className={styles.typeIcon}
              type={deposit.type}
            />
            <RText className={styles.typeLabel} size="body-sm">
              {getTypeLabel(deposit)}
            </RText>
          </span>
        </div>
        <div className={styles.cell} role="cell">
          <div className={styles.amount}>
            <RText size="body-sm" weight="medium">
              {hasTotalValue ? (
                <>
                  $
                  <Money fiat tooltip={false}>
                    {deposit.total ?? 0}
                  </Money>
                </>
              ) : (
                "—"
              )}
            </RText>
            <RText color="neutral-700" size="body-s">
              <Money tooltip={false}>{deposit.amount}</Money> {assetSymbol}
            </RText>
          </div>
        </div>
        <div className={styles.cell} role="cell">
          <OperationHash operationHash={deposit.operation_hash} />
        </div>
        <div className={classNames(styles.cell, styles.cellChain)} role="cell">
          <RText size="body-sm">
            {deposit.chain_from === deposit.chain_to
              ? deposit.chain_from
              : `${deposit.chain_from} - ${deposit.chain_to}`}
          </RText>
        </div>
        <div className={styles.cell} role="cell">
          <span className={styles.statusBadge}>
            <RText className={styles.statusText} size="body-s">
              {deposit.status || "CONFIRMED"}
            </RText>
          </span>
        </div>
      </div>
      <DepositDetailsModal
        deposit={deposit}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </>
  );
}
