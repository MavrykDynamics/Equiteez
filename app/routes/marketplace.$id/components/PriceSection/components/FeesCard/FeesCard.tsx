import { FC, useState } from "react";

import clsx from "clsx";

import ChevronDownIcon from "app/icons/chevron-down.svg?react";
// eslint-disable-next-line import/no-named-as-default
import type BigNumber from "bignumber.js";
import Money from "~/lib/atoms/Money";

import styles from "./styles.module.css";

type FeesCardProps = {
  className?: string;
  // Kept optional for backwards compatibility with callers; the grand total is
  // shown separately as "Order Total", so this card only surfaces the fees.
  totalAmount?: BigNumber | number;
  txnFees?: BigNumber | number;
  networkfee: BigNumber | number;
};

export const FeesCard: FC<FeesCardProps> = ({
  className,
  totalAmount = 0,
  txnFees,
  networkfee,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className={clsx(styles.card, className)}>
      <button
        type="button"
        aria-expanded={isOpen}
        className={styles.summaryButton}
        onClick={() => setIsOpen((currentIsOpen) => !currentIsOpen)}
      >
        <span>Order Summary</span>
        <span className={styles.summaryValue}>
          <span className={styles.summaryAmount}>
            $<Money fiat tooltip={false}>{totalAmount}</Money>
          </span>
          <ChevronDownIcon className={styles.arrowIcon} />
        </span>
      </button>

      {isOpen && (
        <div className={styles.details}>
          <div className={styles.detailRow}>
            <p>Platform Fees</p>
            <div className={styles.detailValue}>
              {txnFees === undefined ? (
                "On fill"
              ) : (
                <>
                  $<Money fiat tooltip={false}>{txnFees}</Money>
                </>
              )}
            </div>
          </div>

          <div className={styles.detailRow}>
            <p>Network Fee</p>
            <div className={styles.detailValue}>
              <Money tooltip={false}>{networkfee}</Money> MVRK
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
