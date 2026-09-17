import clsx from "clsx";

import Money from "~/lib/atoms/Money";
import { RIcon, RIconSize } from "~/lib/atoms/RIcon";
import { RText } from "~/lib/atoms/RTypography/RText";

import styles from "./RPriceChange.module.css";
import { RTextSize } from "~/lib/atoms/RTypography/types";

export type RPriceChangeProps = {
  amount?: number | null;
  className?: string;
  periodLabel?: string;
  percentage?: number | null;
  showPeriodLabel?: boolean;
  size?: RTextSize;
  iconSize?: RIconSize;
};

export function RPriceChange({
  amount,
  className,
  periodLabel = "24h",
  percentage,
  showPeriodLabel = false,
  size = "body-s", 
  iconSize = "small"
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
            size={iconSize}
            viewBox="0 0 24 20"
          />
          <RText className={changeClassName} size={size}>
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
        <RText color="neutral-700" size={size}>
          --
        </RText>
      )}
      {showPeriodLabel ? (
        <RText color="neutral-700" size={size}>
          {periodLabel}
        </RText>
      ) : null}
    </div>
  );
}
