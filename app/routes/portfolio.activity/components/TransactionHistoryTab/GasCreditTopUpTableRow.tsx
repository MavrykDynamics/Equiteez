import { BigNumber } from "bignumber.js";
import clsx from "clsx";
import TopUpIcon from "app/icons/gas-credit-top-up.svg?react";

import type { GasCreditTopUpItemType } from "~/lib/apis/rwa/orders/orders.types";
import Money from "~/lib/atoms/Money";
import { RText } from "~/lib/atoms/RTypography/RText";
import { formatOrderDate } from "~/routes/trade.$address/components/AssetTabs/OpenOrdersTab/OrderItem";
import { ROrderStatusBadge } from "~/routes/trade.$address/components/AssetTabs/OrderHistoryTab/ROrderStatusBadge";

import { OperationHash } from "./OperationHash";
import styles from "./styles.module.css";

type GasCreditTopUpTableRowProps = {
  transaction: GasCreditTopUpItemType;
};

/** Recorded token amount, else units at the decimals captured on submission. */
function getTopUpTokenAmount({
  amount,
  gas_credit_top_up: topUp,
}: GasCreditTopUpItemType) {
  if (amount !== null) return amount;
  if (topUp.token_decimals == null) return null;

  return new BigNumber(topUp.amount_units)
    .shiftedBy(-topUp.token_decimals)
    .toNumber();
}

export function GasCreditTopUpTableRow({
  transaction,
}: GasCreditTopUpTableRowProps) {
  const [formattedDate, formattedTime = ""] = formatOrderDate(
    transaction.datetime
  ).split(", ");
  const tokenAmount = getTopUpTokenAmount(transaction);
  const tokenSymbol = transaction.gas_credit_top_up.token_symbol ?? "";
  const total = transaction.total ?? null;
  const isPending = transaction.status.trim().toLowerCase() === "pending";

  return (
    // No details modal for top-ups: the row is not interactive.
    <div className={clsx(styles.row, styles.staticRow)}>
      <div className={styles.cell} role="cell">
        <div className={styles.date}>
          <RText size="body-sm">{formattedDate}</RText>
          <RText color="neutral-700" size="body-s">
            {formattedTime}
          </RText>
        </div>
      </div>
      <div className={styles.cell} role="cell">
        <RText size="body-sm">Gas Credits</RText>
      </div>
      <div className={styles.cell} role="cell">
        <span className={styles.buy}>
          <TopUpIcon aria-hidden />
          <RText className={styles.typeLabel} size="body-sm">
            Top Up
          </RText>
        </span>
      </div>
      <div className={styles.cell} role="cell">
        <div className={styles.amount}>
          <RText size="body-sm" weight="medium">
            {total !== null ? (
              <>
                $
                <Money fiat tooltip={false}>
                  {total}
                </Money>
              </>
            ) : tokenAmount !== null ? (
              <>
                <Money tooltip={false}>{tokenAmount}</Money> {tokenSymbol}
              </>
            ) : (
              "—"
            )}
          </RText>
          {total !== null && tokenAmount !== null && (
            <RText color="neutral-700" size="body-s">
              <Money tooltip={false}>{tokenAmount}</Money> {tokenSymbol}
            </RText>
          )}
        </div>
      </div>
      <div className={styles.cell} role="cell">
        <RText size="body-sm">Gas Station</RText>
      </div>
      <div className={styles.cell} role="cell">
        {transaction.operation_hash ? (
          <OperationHash operationHash={transaction.operation_hash} />
        ) : (
          <RText size="body-sm">—</RText>
        )}
      </div>
      <div className={styles.cell} role="cell">
        <ROrderStatusBadge
          status={transaction.status}
          label={isPending ? "PENDING" : undefined}
        />
      </div>
    </div>
  );
}
