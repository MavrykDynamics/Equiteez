import { RSkeleton } from "~/lib/atoms/RSkeleton";

import styles from "./BuySellPanelSkeleton.module.css";

const SUMMARY_ROWS_COUNT = 3;

const range = (length: number) => Array.from({ length }, (_, index) => index);

// Placeholder for the buy/sell (and primary purchase) panel while its own data
// (orderbook config, primary purchase config) is still loading after the page
// skeleton has already been replaced.
export function BuySellPanelSkeleton() {
  return (
    <div aria-busy="true" className={styles.skeleton} role="status">
      <div className={styles.tabs}>
        <RSkeleton className={styles.tab} radius="pill" variant="surface" />
        <RSkeleton className={styles.tab} radius="pill" variant="surface" />
      </div>

      <RSkeleton className={styles.select} radius="sm" variant="surface" />

      <div className={styles.priceRow}>
        <RSkeleton className={styles.label} variant="surface" />
        <RSkeleton className={styles.value} variant="surface" />
      </div>

      <RSkeleton className={styles.input} radius="sm" variant="surface" />
      <RSkeleton className={styles.input} radius="sm" variant="surface" />

      <RSkeleton className={styles.slider} radius="pill" variant="surface" />

      <div className={styles.summary}>
        {range(SUMMARY_ROWS_COUNT).map((row) => (
          <div className={styles.priceRow} key={row}>
            <RSkeleton className={styles.label} variant="surface" />
            <RSkeleton className={styles.value} variant="surface" />
          </div>
        ))}
      </div>

      <RSkeleton className={styles.button} radius="pill" variant="surface" />
    </div>
  );
}
