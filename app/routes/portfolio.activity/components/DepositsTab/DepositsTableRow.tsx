import type { TransferHistoryItemType } from "~/lib/apis/rwa/orders/orders.types";
import { toTokenSlug } from "~/lib/assets";
import Money from "~/lib/atoms/Money";
import { RText } from "~/lib/atoms/RTypography/RText";
import { OperationHash } from "~/routes/portfolio.activity/components/TransactionHistoryTab/OperationHash";
import { formatOrderDate } from "~/routes/trade.$address/components/AssetTabs/OpenOrdersTab/OrderItem";
import { AssetIcon } from "~/templates/AssetIcon";

import styles from "./styles.module.css";
import { useAssetMetadata } from "~/lib/metadata";

type DepositsTableRowProps = {
  deposit: TransferHistoryItemType;
};

export function DepositsTableRow({ deposit }: DepositsTableRowProps) {
  const [formattedDate, formattedTime = ""] = formatOrderDate(
    deposit.datetime
  ).split(", ");

  const assetSlug = toTokenSlug(deposit.token_address);
  const metadata = useAssetMetadata(assetSlug);

  const assetSymbol = metadata.symbol;
  const assetName = metadata.name;
  const isDeposit = deposit.type === "deposit";
  const hasTotalValue = deposit.total !== null;

  return (
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
        <div className={styles.asset}>
          <AssetIcon
            assetSlug={assetSlug}
            className={styles.assetIcon}
            size={30}
          />
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
        <span
          className={isDeposit ? styles.depositType : styles.withdrawalType}
        >
          <svg
            aria-hidden="true"
            className={styles.typeIcon}
            fill="none"
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d={
                isDeposit
                  ? "M8 3.33301V12.6663M4 8.66634L8 12.6663L12 8.66634"
                  : "M8 12.6663V3.33301M12 7.33301L8 3.33301L4 7.33301"
              }
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <RText className={styles.typeLabel} size="body-sm">
            {isDeposit ? "Deposit" : "Withdrawal"}
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
                  {deposit.total}
                </Money>
              </>
            ) : (
              "—"
            )}
          </RText>
          <RText color="neutral-600" size="body-s">
            <Money tooltip={false}>{deposit.amount}</Money> {assetSymbol}
          </RText>
        </div>
      </div>
      <div className={styles.cell} role="cell">
        <RText size="body-sm">Mavryk Bridge</RText>
      </div>
      <div className={styles.cell} role="cell">
        <OperationHash operationHash={deposit.operation_hash} />
      </div>
      <div className={styles.cell} role="cell">
        <span className={styles.statusBadge}>
          <RText className={styles.statusText} size="body-s">
            {deposit.status || "CONFIRMED"}
          </RText>
        </span>
      </div>
    </div>
  );
}
