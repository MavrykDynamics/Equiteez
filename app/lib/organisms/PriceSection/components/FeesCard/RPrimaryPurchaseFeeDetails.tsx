import { BigNumber } from "bignumber.js";

import { useUsdToTokenRates } from "~/lib/fiat-currency";
import { MVRK_ASSET_SLUG } from "~/lib/metadata";
import { calculateOrderSummaryValues } from "./FeesCard.utils";
import { feeBreakdownTooltip, InfoButton } from "./RGasPaymentDetails";
import styles from "./styles.module.css";

/**
 * Primary sales always pay MVRK gas; the purchase fee is already part of the
 * payment amount. Gas is known only after the Buy preflight estimate, because
 * amount edits never estimate a contract operation (docs/primary-purchases.md).
 */
export function RPrimaryPurchaseFeeDetails({
  purchaseFee,
  gasFee,
}: {
  /** Included purchase fee, in payment-token units (USDT). */
  purchaseFee: BigNumber;
  /** Network fee in MVRK; undefined until estimated. */
  gasFee?: BigNumber;
}) {
  const mvrkUsdRate = useUsdToTokenRates()[MVRK_ASSET_SLUG];
  const { gasFeeUsd } = calculateOrderSummaryValues({
    gasFee,
    feeUsdRate: mvrkUsdRate,
  });
  const feeTooltip = feeBreakdownTooltip([
    { label: "Purchase Fee (included)", value: `$${purchaseFee.toFixed(6)}` },
    {
      label: "Gas Fee",
      value: gasFee === undefined ? "-" : `$${gasFeeUsd.toFixed(6)}`,
    },
  ]);

  return (
    <div className={styles.detailRow}>
      <span className={styles.feeLabel}>
        Platform Fee
        <InfoButton
          allowHTML
          content={feeTooltip}
          label="Platform fee breakdown"
        />
      </span>
      <span className={styles.detailValue}>
        ~ ${purchaseFee.plus(gasFeeUsd).toFixed(6)}
      </span>
    </div>
  );
}
