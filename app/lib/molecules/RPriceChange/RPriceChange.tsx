import clsx from "clsx";

import Money from "~/lib/atoms/Money";
import { RIcon } from "~/lib/atoms/RIcon";
import { RText } from "~/lib/atoms/RTypography/RText";

import styles from "./RPriceChange.module.css";

export type RPriceChangeProps = {
  amount?: number | null;
  className?: string;
  periodLabel?: string;
  percentage?: number | null;
  showPeriodLabel?: boolean;
};

export function RPriceChange({
  amount,
  className,
  periodLabel = "24h",
  percentage,
  showPeriodLabel = false,
}: RPriceChangeProps) {
  const hasChangeData = !!amount;
  const isNegative = (percentage ?? 0) < 0;
  const changeClassName = isNegative ? styles.negative : styles.positive;
  return (
    <div className={clsx(styles.root, className)}>
      {hasChangeData ? (
        <span className={styles.change}>
          <RIcon
            className={changeClassName}
            name={isNegative ? "trending-down" : "trending-up"}
            size="small"
          />
          <RText className={changeClassName} size="body-s">
            $
            <Money tooltip={false} fiat>
              {Math.abs(amount)}
            </Money>{" "}
            ({isNegative ? "-" : "+"}
            <Money tooltip={false} fiat>
              {Math.abs(percentage ?? 0)}
            </Money>
            %)
          </RText>
        </span>
      ) : (
        <RText color="neutral-600" size="body-s">
          --
        </RText>
      )}
      {showPeriodLabel ? (
        <RText color="neutral-600" size="body-s">
          {periodLabel}
        </RText>
      ) : null}
    </div>
  );
}
