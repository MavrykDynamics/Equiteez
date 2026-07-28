import styles from "./styles.module.css";

type OrderbookBarProps = {
  buyPercentage: number;
  sellPercentage: number;
};

const formatPercentage = (value: number) => {
  const percentage = Number.isFinite(value)
    ? Math.min(Math.max(value, 0), 100)
    : 0;

  return `${percentage}%`;
};

export function OrderbookBar({
  buyPercentage,
  sellPercentage,
}: OrderbookBarProps) {
  const buyLabel = formatPercentage(buyPercentage);
  const sellLabel = formatPercentage(sellPercentage);

  return (
    <div
      className={styles.orderbookWrapper}
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
