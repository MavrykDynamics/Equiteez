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
  const amountUsdValue = amountUsd ? (
    <span>
      $
      <Money fiat tooltip={false}>
        {amountUsd}
      </Money>
    </span>
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
    <span>
      $
      <Money fiat tooltip={false}>
        {totalUsd}
      </Money>
    </span>
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
        <RText size="body-sm">
          Summary
        </RText>
        <span className={styles.summaryTriggerValue}>
          <RText size="body-sm" weight="medium">
            {totalUsdValue}
          </RText>
          <RIcon
            aria-hidden="true"
            name={isOpen ? "arrow-short-up" : "arrow-short-down"}
            size="small"
          />
        </span>
      </button>
      {isOpen ? (
        <div className={styles.summaryExpanded} id="withdrawal-summary-details">
          <div className={styles.summaryDetails}>
            <SummaryRow label="Withdraw Amount" value={amountUsdValue} />
            <SummaryRow label="Network Fee" value={<span>~ {feeUsdValue}</span>} />
          </div>
          <div aria-hidden="true" className={styles.summaryDivider} />
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
      <RText
        color={isTotal ? "neutral-black" : "neutral-700"}
        size={isTotal ? "body-sm" : "body-s"}
      >
        {label}
      </RText>
      <RText
        size={isTotal ? "body-sm" : "body-s"}
        weight={isTotal ? "medium" : "regular"}
      >
        {value}
      </RText>
    </div>
  );
}
