import type { ReactNode } from "react";
import BigNumber from "bignumber.js";

import Money from "~/lib/atoms/Money";
import { RIcon } from "~/lib/atoms/RIcon";
import { RText } from "~/lib/atoms/RTypography/RText";

import type { WithdrawableAsset } from "./useWithdrawableAssets";
import styles from "./WithdrawFundsModal.module.css";

type WithdrawalSummaryProps = {
  amount: string;
  asset?: WithdrawableAsset;
  isOpen: boolean;
  onToggle: () => void;
};

const NETWORK_FEE_USD = new BigNumber(0.01);

export function WithdrawalSummary({
  amount,
  asset,
  isOpen,
  onToggle,
}: WithdrawalSummaryProps) {
  const requestedAmount = new BigNumber(amount);
  const displayAmount = requestedAmount.isFinite()
    ? requestedAmount
    : new BigNumber(0);
  const amountUsd =
    asset?.priceUsd?.isFinite() && asset.priceUsd.gt(0)
      ? asset.priceUsd.times(displayAmount)
      : null;
  const totalUsd = amountUsd ? amountUsd.plus(NETWORK_FEE_USD) : null;
  const tokenAmount = (
    <>
      <Money tooltip={false}>{displayAmount}</Money>{" "}
      {asset?.metadata.symbol ?? ""}
    </>
  );
  const amountUsdValue = amountUsd ? (
    <>
      $
      <Money fiat tooltip={false}>
        {amountUsd}
      </Money>
    </>
  ) : (
    "Price unavailable"
  );
  const feeUsdValue = (
    <span>
      $
      <Money fiat tooltip={false}>
        {NETWORK_FEE_USD}
      </Money>
    </span>
  );
  const totalUsdValue = totalUsd ? (
    <>
      $
      <Money fiat tooltip={false}>
        {totalUsd}
      </Money>
    </>
  ) : (
    feeUsdValue
  );

  return (
    <section aria-label="Withdrawal summary" className={styles.summary}>
      <button
        aria-controls="withdrawal-summary-details"
        aria-expanded={isOpen}
        className={styles.summaryTrigger}
        onClick={onToggle}
        type="button"
      >
        <RText size="body-sm" weight="medium">
          Summary
        </RText>
        <span className={styles.summaryTriggerValue}>
          <span className={styles.summaryTriggerAmounts}>
            <RText color="neutral-700" size="body-xs">
              {totalUsdValue}
            </RText>
          </span>
          <RIcon
            aria-hidden="true"
            name={isOpen ? "arrow-short-up" : "arrow-short-down"}
            size="small"
          />
        </span>
      </button>
      {isOpen ? (
        <div className={styles.summaryDetails} id="withdrawal-summary-details">
          <SummaryRow
            label="Withdraw Amount"
            value={
              <span className={styles.summaryUsdValue}>{amountUsdValue}</span>
            }
          />
          <SummaryRow label="Network Fee" value={feeUsdValue} />
          <SummaryRow isTotal label="Total" value={totalUsdValue} />
        </div>
      ) : null}
    </section>
  );
}

function SummaryRow({
  isTotal = false,
  label,
  value,
}: {
  isTotal?: boolean;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className={isTotal ? styles.summaryTotal : styles.summaryRow}>
      <RText size="body-sm" weight={isTotal ? "medium" : "regular"}>
        {label}
      </RText>
      <RText size="body-sm" weight="medium">
        {value}
      </RText>
    </div>
  );
}
