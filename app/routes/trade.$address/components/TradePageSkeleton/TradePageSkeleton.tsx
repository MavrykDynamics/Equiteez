import { Container } from "~/lib/atoms/Container/Container";
import { RSkeleton } from "~/lib/atoms/RSkeleton";
import { RText } from "~/lib/atoms/RTypography/RText";

import pageStyles from "../../styles.module.css";
import styles from "./TradePageSkeleton.module.css";

const ASSET_TAB_WIDTHS = [138, 128, 88, 106];
const SIDE_TAB_WIDTHS = [119, 123];
const DETAIL_COLUMNS_COUNT = 3;
const DETAIL_ROWS_COUNT = 2;
const DETAIL_GROUPS_COUNT = 2;
const WHY_INVEST_COLUMNS_COUNT = 2;
const WHY_INVEST_ROWS_COUNT = 2;

const range = (length: number) => Array.from({ length }, (_, index) => index);

function SectionTitle() {
  return <RSkeleton
      className={styles.sectionTitle}
      radius="none"
      variant="surface"
    />;
}

function DetailsGroupSkeleton() {
  return (
    <div className={styles.section}>
      <SectionTitle />
      <div className={styles.detailColumns}>
        {range(DETAIL_COLUMNS_COUNT).map((column) => (
          <div className={styles.detailColumn} key={column}>
            {range(DETAIL_ROWS_COUNT).map((row) => (
              <RSkeleton
                className={styles.detailItem}
                key={row}
                radius="none"
                variant="surface"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function WhyInvestSkeleton() {
  return (
    <div className={styles.section}>
      <SectionTitle />
      <div className={styles.investColumns}>
        {range(WHY_INVEST_COLUMNS_COUNT).map((column) => (
          <div className={styles.investColumn} key={column}>
            {range(WHY_INVEST_ROWS_COUNT).map((row) => (
              <RSkeleton
                className={styles.investItem}
                key={row}
                radius="none"
                variant="surface"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function LocationSkeleton() {
  return (
    <div className={styles.location}>
      <SectionTitle />
      <RSkeleton
        className={styles.locationText}
        radius="none"
        variant="surface"
      />
      <RSkeleton className={styles.map} radius="md" variant="surface" />
    </div>
  );
}

// Mirrors the secondary-market trade page (chart + buy/sell panel) and reuses
// the page layout classes so it reflows exactly like the loaded page.
export function TradePageSkeleton() {
  return (
    <Container className={pageStyles.tradeContainer}>
      <RText
        className={pageStyles.viewOnlyNotice}
        color="neutral-700"
        size="body-s"
      >
        View-only on mobile. Open on desktop to trade.
      </RText>
      <div aria-busy="true" className={pageStyles.contentBlock}>
        <div className={pageStyles.mainContent}>
          <div className={styles.details}>
            <div className={styles.assetInfoGroup}>
              <RSkeleton
                className={styles.assetInfo}
                radius="sm"
                variant="surface"
              >
                <RSkeleton className={styles.assetIcon} radius="pill" />
              </RSkeleton>
              <RSkeleton
                className={styles.badges}
                radius="pill"
                variant="surface"
              />
            </div>
            <div className={styles.actions}>
              <RSkeleton
                height={34}
                radius="pill"
                variant="surface"
                width={34}
              />
              <RSkeleton
                height={34}
                radius="pill"
                variant="surface"
                width={34}
              />
            </div>
          </div>

          <RSkeleton className={styles.chart} radius="md" variant="surface" />
          {/* Same container as the loaded RChartStats, so the skeleton switches
              between one and two rows with the same container query */}
          <div className={pageStyles.chartStats}>
            <RSkeleton className={styles.stats} radius="md" variant="surface" />
          </div>

          <div className={styles.tabs}>
            <div className={styles.tabSwitcher}>
              <div className={styles.tabGroup}>
                {ASSET_TAB_WIDTHS.map((width) => (
                  <RSkeleton
                    height={39}
                    key={width}
                    radius="pill"
                    variant="surface"
                    width={width}
                  />
                ))}
              </div>
              <span className={styles.divider} />
              <div className={styles.sideTabs}>
                {SIDE_TAB_WIDTHS.map((width) => (
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

            {/* Asset Overview tab: About, Why Invest, Features, Amenities and
                Location, laid out like AssetOverviewTab */}
            <div className={styles.overview}>
              <div className={styles.section}>
                <SectionTitle />
                <RSkeleton
                  className={styles.paragraph}
                  radius="none"
                  variant="surface"
                />
              </div>

              <WhyInvestSkeleton />

              <div className={styles.detailGroups}>
                {range(DETAIL_GROUPS_COUNT).map((group) => (
                  <DetailsGroupSkeleton key={group} />
                ))}
              </div>

              <LocationSkeleton />
            </div>
          </div>
        </div>

        <div className={pageStyles.tradeColumn}>
          <div className={pageStyles.tradeColumnContent}>
            <RSkeleton
              className={styles.gallery}
              radius="md"
              variant="surface"
            />
            <RSkeleton
              className={styles.buySell}
              radius="md"
              variant="surface"
            />
          </div>
        </div>
      </div>
    </Container>
  );
}
