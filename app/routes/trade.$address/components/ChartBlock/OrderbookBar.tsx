import type { CSSProperties } from "react";

import styles from "./styles.module.css";

type OrderbookBarProps = {
  buyPercentage: number;
  sellPercentage: number;
};

const normalizePercentage = (value: number) =>
  Number.isFinite(value) ? Math.min(Math.max(value, 0), 100) : 0;

const formatPercentage = (value: number) => `${normalizePercentage(value)}%`;

export function OrderbookBar({
  buyPercentage,
  sellPercentage,
}: OrderbookBarProps) {
  const normalizedBuyPercentage = normalizePercentage(buyPercentage);
  const buyLabel = formatPercentage(normalizedBuyPercentage);
  const sellLabel = formatPercentage(sellPercentage);

  return (
    <div
      className={styles.orderbookWrapper}
      style={
        {
          "--buy-percentage": `${normalizedBuyPercentage}%`,
        } as CSSProperties
      }
      aria-label={`Order book: ${buyLabel} buy orders and ${sellLabel} sell orders`}
    >
      <div className={styles.side}>
        <span className={styles.buyBadge} aria-hidden="true">
          B
        </span>
        <span className={styles.buyPercentage}>{buyLabel}</span>
      </div>

      <div className={styles.side}>
        <span className={styles.sellPercentage}>{sellLabel}</span>
        <span className={styles.sellBadge} aria-hidden="true">
          S
        </span>
      </div>
    </div>
  );
}
