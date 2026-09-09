import { FC, useMemo, useState } from "react";

import clsx from "clsx";

import ChevronDownIcon from "app/icons/chevron-down.svg?react";
import type { BigNumber } from "bignumber.js";
import Money from "~/lib/atoms/Money";
import { useUsdToTokenRates } from "~/lib/fiat-currency";
import { MVRK_ASSET_SLUG } from "~/lib/metadata";

import styles from "./styles.module.css";
import { calculateOrderSummaryValues } from "./FeesCard.utils";

type FeesCardProps = {
  className?: string;
  networkFee: BigNumber.Value;
  pricePerShare?: BigNumber.Value;
  totalAmount?: BigNumber.Value;
};

export const FeesCard: FC<FeesCardProps> = ({
  className,
  networkFee,
  pricePerShare,
  totalAmount = 0,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const usdToTokenRates = useUsdToTokenRates();
  const mvrkUsdRate = usdToTokenRates[MVRK_ASSET_SLUG];
  const { networkFeeUsd, pricePerShare: displayPricePerShare, totalValue } =
    useMemo(
      () =>
        calculateOrderSummaryValues({
          networkFee,
          networkFeeUsdRate: mvrkUsdRate,
          orderValue: totalAmount,
          pricePerShare,
        }),
      [mvrkUsdRate, networkFee, pricePerShare, totalAmount]
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
            $<Money fiat tooltip={false}>{totalValue}</Money>
          </span>
          <ChevronDownIcon className={styles.arrowIcon} />
        </span>
      </button>

      {isOpen && (
        <>
          <div className={styles.details}>
            <div className={styles.detailRow}>
              <span>Price per share</span>
              <span className={styles.detailValue}>
                $<Money fiat tooltip={false}>{displayPricePerShare}</Money>
              </span>
            </div>

            <div className={styles.detailRow}>
              <span>Network Fee</span>
              <span className={styles.detailValue}>
                ~ $<Money fiat tooltip={false}>{networkFeeUsd}</Money>
              </span>
            </div>
          </div>

          <div className={styles.divider} />

          <div className={styles.totalRow}>
            <span>Total</span>
            <span className={styles.totalValue}>
              $<Money fiat tooltip={false}>{totalValue}</Money>
            </span>
          </div>
        </>
      )}
    </section>
  );
};
