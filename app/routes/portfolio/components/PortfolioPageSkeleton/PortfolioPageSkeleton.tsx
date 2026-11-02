import { RSkeleton } from "~/lib/atoms/RSkeleton";

import welcomeStyles from "../WelcomeBlock/styles.module.css";
import styles from "./PortfolioPageSkeleton.module.css";

// Overview, Activity, Notifications, Profile
const TAB_WIDTHS = [97, 84, 118, 77];
const METRICS_COUNT = 3;
const TABLE_COLUMNS_COUNT = 6;
// Amount, Avg Price, Price / 1M, Yield, Profit — two-line cells show a sub-value
const VALUE_CELLS_TWO_LINE = [true, false, true, false, false];
const TABLE_ROWS_COUNT = 10;
const LEGEND_ITEMS_COUNT = 10;

// --r-radius-pill is a fixed radius, so circles need 50% inline to win over it
const CIRCLE = { borderRadius: "50%" };

const range = (length: number) => Array.from({ length }, (_, index) => index);

function ValueSkeleton({ size }: { size: "large" | "medium" }) {
  const isLarge = size === "large";

  return (
    <div className={styles.valueGroup}>
      <RSkeleton
        className={isLarge ? styles.valueLabelLarge : styles.valueLabel}
        radius="none"
      />
      <RSkeleton
        className={isLarge ? styles.valueLarge : styles.valueMedium}
        radius="none"
      />
      <RSkeleton
        className={isLarge ? styles.valueCaptionLarge : styles.valueCaption}
        radius="none"
      />
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className={styles.content}>
      <RSkeleton className={styles.statsCard} radius="lg" variant="surface">
        <div className={styles.valueSection}>
          <ValueSkeleton size="large" />
        </div>
        <div className={styles.metrics}>
          {range(METRICS_COUNT).map((metric) => (
            <div className={styles.metric} key={metric}>
              <ValueSkeleton size="medium" />
            </div>
          ))}
        </div>
      </RSkeleton>

      <RSkeleton className={styles.assetsCard} radius="lg" variant="surface">
        <div className={styles.tableSection}>
          <div className={styles.toolbar}>
            <RSkeleton className={styles.tableTitle} radius="none" />
            <RSkeleton className={styles.search} radius="sm" />
          </div>
          <div className={styles.table}>
            <div className={styles.tableRow}>
              {range(TABLE_COLUMNS_COUNT).map((column) => (
                <div key={column}>
                  <RSkeleton className={styles.headerCell} radius="none" />
                </div>
              ))}
            </div>
            {range(TABLE_ROWS_COUNT).map((row) => (
              <div className={styles.tableRow} key={row}>
                <div className={styles.assetCell}>
                  <RSkeleton className={styles.assetIcon} style={CIRCLE} />
                  <div className={styles.assetLines}>
                    <RSkeleton className={styles.assetName} radius="none" />
                    <RSkeleton className={styles.assetSymbol} radius="none" />
                  </div>
                </div>
                {VALUE_CELLS_TWO_LINE.map((twoLine, cell) => (
                  <div className={styles.cellLines} key={cell}>
                    <RSkeleton
                      className={twoLine ? styles.line : styles.lineShort}
                      radius="none"
                    />
                    {twoLine ? (
                      <RSkeleton className={styles.subLine} radius="none" />
                    ) : null}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.chartPanel}>
          <RSkeleton className={styles.chartTitle} radius="none" />
          <RSkeleton className={styles.donut} style={CIRCLE} />
          <div className={styles.legend}>
            {range(LEGEND_ITEMS_COUNT).map((item) => (
              <RSkeleton
                className={styles.legendItem}
                key={item}
                radius="none"
              />
            ))}
          </div>
        </div>
      </RSkeleton>
    </div>
  );
}

// Shown while the stored auth session is being restored, so the page doesn't
// flash the "Log Into Your Account" state with a spinner. The overview body is
// only drawn on the overview tab — other tabs get just the shared header.
export function PortfolioPageSkeleton({
  withOverview,
}: {
  withOverview: boolean;
}) {
  return (
    <div aria-busy="true" role="status">
      <div className={welcomeStyles.wrapper}>
        <div className={welcomeStyles.welcome}>
          <RSkeleton className={styles.welcomeTitle} variant="surface" />
          <div className={welcomeStyles.actions}>
            <RSkeleton
              height={45}
              radius="pill"
              variant="surface"
              width={121}
            />
            <RSkeleton
              height={45}
              radius="pill"
              variant="surface"
              width={138}
            />
          </div>
        </div>
        <div className={styles.tabs}>
          {TAB_WIDTHS.map((width) => (
            <RSkeleton
              height={39}
              key={width}
              radius="pill"
              variant="surface"
              width={width}
            />
          ))}
        </div>
      </div>
      {withOverview ? <OverviewSkeleton /> : null}
    </div>
  );
}
