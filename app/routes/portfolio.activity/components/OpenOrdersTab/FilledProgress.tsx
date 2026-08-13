import type { CSSProperties } from "react";

import type { OpenOrderItemType } from "~/lib/apis/rwa/orders/orders.types";
import Money from "~/lib/atoms/Money";
import { RText } from "~/lib/atoms/RTypography/RText";

import styles from "./styles.module.css";

type FilledProgressProps = {
  order: OpenOrderItemType;
};

export function FilledProgress({ order }: FilledProgressProps) {
  const filledPercent = Math.min(Math.max(order.filled_percent, 0), 100);
  const filledProgressStyle = {
    "--filled-percent": `${filledPercent}%`,
  } as CSSProperties;

  return (
    <div className={styles.filled}>
      <div className={styles.filledAmounts}>
        <RText size="body-sm">
          <Money fiat tooltip={false}>
            {order.filled_amount}
          </Money>
        </RText>
        <RText color="neutral-600" size="body-s">
          / <Money fiat tooltip={false}>{order.amount}</Money>
        </RText>
      </div>
      <div className={styles.filledProgress}>
        <span className={styles.filledTrack}>
          <span className={styles.filledValue} style={filledProgressStyle} />
        </span>
        <RText color="neutral-600" size="body-s">
          {filledPercent}%
        </RText>
      </div>
    </div>
  );
}
