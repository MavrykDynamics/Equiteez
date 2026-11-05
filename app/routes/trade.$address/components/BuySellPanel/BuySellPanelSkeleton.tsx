import { RSkeleton } from "~/lib/atoms/RSkeleton";

import styles from "./BuySellPanelSkeleton.module.css";

const SLIDER_STOPS_COUNT = 5;
const SUMMARY_DETAIL_ROWS_COUNT = 3;

const range = (length: number) => Array.from({ length }, (_, index) => index);

// Pay with / Receive balance card: label + balance, asset pill + amount, value
function BalanceCardSkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.row}>
        <RSkeleton className={styles.cardLabel} variant="surface" />
        <RSkeleton className={styles.cardBalance} variant="surface" />
      </div>
      <div className={styles.row}>
        <RSkeleton
          className={styles.assetPill}
          radius="pill"
          variant="surface"
        />
        <RSkeleton className={styles.amount} variant="surface" />
      </div>
      <div className={styles.rowEnd}>
        <RSkeleton className={styles.cardValue} variant="surface" />
      </div>
    </div>
  );
}

// Placeholder for the buy/sell (and primary purchase) panel while its own data
// (orderbook config, primary purchase config) is still loading after the page
// skeleton has already been replaced. Mirrors BuySellContent block by block:
// Market dropdown + Buy/Sell tabs, two balance cards, the percentage slider,
// the Order Summary card and the submit button (a view-only hint on mobile).
export function BuySellPanelSkeleton() {
  return (
    <div aria-busy="true" className={styles.skeleton} role="status">
      <div className={styles.controls}>
        <RSkeleton
          className={styles.marketDropdown}
          radius="pill"
          variant="surface"
        />
        <div className={styles.sideTabs}>
          <RSkeleton
            className={styles.sideTab}
            radius="pill"
            variant="surface"
          />
          <RSkeleton
            className={styles.sideTab}
            radius="pill"
            variant="surface"
          />
        </div>
      </div>

      <div className={styles.fields}>
        <BalanceCardSkeleton />
        <BalanceCardSkeleton />

        <div className={styles.slider}>
          <RSkeleton
            className={styles.sliderTrack}
            radius="pill"
            variant="surface"
          />
          <div className={styles.sliderLabels}>
            {range(SLIDER_STOPS_COUNT).map((stop) => (
              <RSkeleton
                className={styles.sliderLabel}
                key={stop}
                variant="surface"
              />
            ))}
          </div>
        </div>

        <div className={styles.summary}>
          <div className={styles.row}>
            <RSkeleton className={styles.summaryLabel} variant="surface" />
            <RSkeleton className={styles.summaryValue} variant="surface" />
          </div>
          {/* Hidden: FeesCard starts collapsed */}
          <div className={styles.summaryDetails}>
            <div className={styles.summaryRows}>
              {range(SUMMARY_DETAIL_ROWS_COUNT).map((row) => (
                <div className={styles.row} key={row}>
                  <RSkeleton className={styles.detailLabel} variant="surface" />
                  <RSkeleton className={styles.detailValue} variant="surface" />
                </div>
              ))}
            </div>
            <span className={styles.divider} />
            <div className={styles.row}>
              <RSkeleton className={styles.totalLabel} variant="surface" />
              <RSkeleton className={styles.totalValue} variant="surface" />
            </div>
          </div>
        </div>
      </div>

      <RSkeleton className={styles.button} radius="pill" variant="surface" />
      <RSkeleton className={styles.mobileNotice} variant="surface" />
    </div>
  );
}
