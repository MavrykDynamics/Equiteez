import { FC, useMemo, useState } from "react";

import clsx from "clsx";
import { renderToStaticMarkup } from "react-dom/server";
import { InfoTooltip } from "~/lib/organisms/InfoTooltip";

import { BigNumber } from "bignumber.js";
import Money from "~/lib/atoms/Money";
import { useUsdToTokenRates } from "~/lib/fiat-currency";
import { MVRK_ASSET_SLUG } from "~/lib/metadata";

import styles from "./styles.module.css";
import { calculateOrderSummaryValues } from "./FeesCard.utils";
import { RIcon } from "~/lib/atoms/RIcon";

type FeesCardProps = {
  className?: string;
  networkFee: BigNumber.Value;
  orderbookFee?: BigNumber.Value;
  pricePerShare?: BigNumber.Value;
  totalAmount?: BigNumber.Value;
  annualYield?: number;
};

export const FeesCard: FC<FeesCardProps> = ({
  className,
  networkFee,
  orderbookFee,
  pricePerShare,
  totalAmount = 0,
  annualYield,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const usdToTokenRates = useUsdToTokenRates();
  const mvrkUsdRate = usdToTokenRates[MVRK_ASSET_SLUG];
  const {
    networkFeeUsd,
    orderbookFeeUsd,
    platformFeeUsd,
    pricePerShare: displayPricePerShare,
    totalValue,
  } = useMemo(
    () =>
      calculateOrderSummaryValues({
        networkFee,
        orderbookFee,
        networkFeeUsdRate: mvrkUsdRate,
        orderValue: totalAmount,
        pricePerShare,
      }),
    [mvrkUsdRate, networkFee, orderbookFee, pricePerShare, totalAmount]
  );

  const annualIncome = new BigNumber(totalAmount)
    .times(annualYield ?? 0)
    .dividedBy(100);

  const feeTooltip = renderToStaticMarkup(
    <div className={styles.feeTooltip}>
      {[
        {
          label: "Orderbook Fee",
          value:
            orderbookFee === undefined ? "-" : `$${orderbookFeeUsd.toFixed(2)}`,
        },
        { label: "Network Fee", value: `$${networkFeeUsd.toFixed(2)}` },
        { label: "Gas Fee", value: "-" },
      ].map(({ label, value }) => (
        <div className={styles.feeTooltipRow} key={label}>
          <span>{label}</span>
          <span className={styles.feeTooltipValue}>{value}</span>
        </div>
      ))}
    </div>
  );

  return (
    <section className={clsx(styles.card, className)}>
      <button
        type="button"
        aria-expanded={isOpen}
        className={styles.summaryButton}
        onClick={() => setIsOpen((currentIsOpen) => !currentIsOpen)}
      >
        <span className={styles.summaryLabel}>Order Summary</span>
        <span className={styles.summaryValue}>
          <span className={styles.summaryAmount}>
            $
            <Money fiat tooltip={false}>
              {totalValue}
            </Money>
          </span>
          <RIcon
            className={styles.arrowIcon}
            name={"arrow-short-up"}
            size="medium"
          />
        </span>
      </button>

      <div
        aria-hidden={!isOpen}
        className={clsx(styles.summaryPanel, isOpen && styles.summaryPanelOpen)}
      >
        <div className={styles.summaryContent}>
          <div className={styles.summaryContentInner}>
            <div className={styles.details}>
              <div className={styles.detailRow}>
                <span>Est. price per share</span>
                <span className={styles.detailValue}>
                  $
                  <Money fiat tooltip={false}>
                    {displayPricePerShare}
                  </Money>
                </span>
              </div>

              <div className={styles.detailRow}>
                <div className={styles.feeLabel}>
                  <span>Platform Fee</span>
                  <InfoTooltip
                    content={feeTooltip}
                    allowHTML
                    className={styles.feeInfoIcon}
                  />
                </div>
                <span className={styles.detailValue}>
                  ~ $
                  <Money fiat tooltip={false}>
                    {platformFeeUsd}
                  </Money>
                </span>
              </div>
              {annualYield !== undefined && (
                <div className={styles.detailRow}>
                  <span>Est. Annual Income</span>
                  <span className={styles.annualIncome}>
                    {annualIncome.isFinite()
                      ? `$${annualIncome.toFixed(2)}/y`
                      : "-"}
                  </span>
                </div>
              )}
            </div>

            <div className={styles.divider} />

            <div className={styles.totalRow}>
              <span>Total</span>
              <span className={styles.totalValue}>
                $
                <Money fiat tooltip={false}>
                  {totalValue}
                </Money>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
