import { RText } from "~/lib/atoms/RTypography/RText";

import styles from "./RPrimarySaleSummary.module.css";

// TODO: Replace with primary-sale API data when available.
const primarySale = { total: 250_000, sold: 225_000 };

export function RPrimarySaleSummary() {
  const remaining = primarySale.total - primarySale.sold;
  const soldPercentage = (primarySale.sold / primarySale.total) * 100;

  return (
    <section className={styles.summary} aria-label="Primary Sale">
      <div className={styles.row}>
        <RText size="body-sm" color="neutral-600">
          Primary Sale
        </RText>
        <RText size="body-l" weight="medium">
          {remaining.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </RText>
      </div>
      <div
        className={styles.progress}
        role="progressbar"
        aria-label="Primary sale tokens sold"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={soldPercentage}
      >
        <div className={styles.fill} style={{ width: `${soldPercentage}%` }} />
      </div>
      <div className={styles.row}>
        <RText size="body-s" color="neutral-600">
          {soldPercentage}% sold
        </RText>
        <RText size="body-s" color="neutral-600">
          {primarySale.total.toLocaleString("en-US")} total
        </RText>
      </div>
    </section>
  );
}
