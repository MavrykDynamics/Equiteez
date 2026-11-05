import type { ComponentType } from "react";

import { RSkeleton } from "~/lib/atoms/RSkeleton";

import mobileStyles from "../MobilePortfolio/styles.module.css";
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

const ACTIVITY_TAB_WIDTHS = [119, 163, 191];
// Open Orders grid: date, 7 value columns, action icon
const ACTIVITY_COLUMNS_COUNT = 8;
const ACTIVITY_ROWS_COUNT = 5;
const NOTIFICATION_DESCRIPTION_WIDTHS = [
  "48%",
  "36%",
  "44%",
  "32%",
  "52%",
  "40%",
  "28%",
  "46%",
  "38%",
  "42%",
];

export type PortfolioPageSkeletonVariant =
  | "overview"
  | "activity"
  | "notifications"
  | "profile"
  | "none";

const range = (length: number) => Array.from({ length }, (_, index) => index);

function ValueSkeleton({ size }: { size: "large" | "medium" }) {
  const isLarge = size === "large";

  return (
    <div className={styles.valueGroup}>
      <RSkeleton
        radius="none"
        className={isLarge ? styles.valueLabelLarge : styles.valueLabel}
      />
      <RSkeleton
        radius="none"
        className={isLarge ? styles.valueLarge : styles.valueMedium}
      />
      <RSkeleton
        radius="none"
        className={isLarge ? styles.valueCaptionLarge : styles.valueCaption}
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
            <RSkeleton radius="none" className={styles.tableTitle} />
            <RSkeleton className={styles.search} radius="sm" />
          </div>
          <div className={styles.table}>
            <div className={styles.tableRow}>
              {range(TABLE_COLUMNS_COUNT).map((column) => (
                <div key={column}>
                  <RSkeleton radius="none" className={styles.headerCell} />
                </div>
              ))}
            </div>
            {range(TABLE_ROWS_COUNT).map((row) => (
              <div className={styles.tableRow} key={row}>
                <div className={styles.assetCell}>
                  <RSkeleton className={styles.assetIcon} style={CIRCLE} />
                  <div className={styles.assetLines}>
                    <RSkeleton radius="none" className={styles.assetName} />
                    <RSkeleton radius="none" className={styles.assetSymbol} />
                  </div>
                </div>
                {VALUE_CELLS_TWO_LINE.map((twoLine, cell) => (
                  <div className={styles.cellLines} key={cell}>
                    <RSkeleton
                      radius="none"
                      className={twoLine ? styles.line : styles.lineShort}
                    />
                    {twoLine ? (
                      <RSkeleton radius="none" className={styles.subLine} />
                    ) : null}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.chartPanel}>
          <RSkeleton radius="none" className={styles.chartTitle} />
          <RSkeleton className={styles.donut} style={CIRCLE} />
          <div className={styles.legend}>
            {range(LEGEND_ITEMS_COUNT).map((item) => (
              <RSkeleton
                radius="none"
                className={styles.legendItem}
                key={item}
              />
            ))}
          </div>
        </div>
      </RSkeleton>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className={styles.content}>
      <RSkeleton className={styles.activityStats} radius="lg" variant="surface">
        {range(METRICS_COUNT).map((item) => (
          <div className={styles.metric} key={item}>
            <ValueSkeleton size="medium" />
          </div>
        ))}
      </RSkeleton>

      <RSkeleton className={styles.card} radius="lg" variant="surface">
        <RSkeleton radius="none" className={styles.tableTitle} />
        <div className={styles.toolbar}>
          <div className={styles.pills}>
            {ACTIVITY_TAB_WIDTHS.map((width) => (
              <RSkeleton height={39} key={width} radius="pill" width={width} />
            ))}
          </div>
          <RSkeleton className={styles.search} radius="sm" />
        </div>
        <div className={styles.table}>
          {range(ACTIVITY_ROWS_COUNT + 1).map((row) => (
            <div
              className={row ? styles.activityRow : styles.activityHeaderRow}
              key={row}
            >
              {range(ACTIVITY_COLUMNS_COUNT).map((cell) => (
                <div key={cell}>
                  {row === 0 ? (
                    <RSkeleton radius="none" className={styles.headerCell} />
                  ) : cell === 0 ? (
                    <div className={styles.cellLines}>
                      <RSkeleton radius="none" className={styles.line} />
                      <RSkeleton radius="none" className={styles.subLine} />
                    </div>
                  ) : (
                    <RSkeleton radius="none" className={styles.lineShort} />
                  )}
                </div>
              ))}
              <div>
                {row ? (
                  <RSkeleton radius="none" className={styles.actionIcon} />
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </RSkeleton>
    </div>
  );
}

function NotificationsSkeleton() {
  return (
    <div className={styles.content}>
      <RSkeleton className={styles.card} radius="md" variant="surface">
        <RSkeleton radius="none" className={styles.notificationsTitle} />
        <div className={styles.notificationsList}>
          {NOTIFICATION_DESCRIPTION_WIDTHS.map((width, index) => (
            <div className={styles.notification} key={index}>
              <div className={styles.notificationLines}>
                <RSkeleton radius="none" className={styles.notificationTitle} />
                <RSkeleton radius="none" style={{ width, height: 17 }} />
              </div>
              <RSkeleton radius="none" className={styles.notificationDate} />
            </div>
          ))}
        </div>
      </RSkeleton>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className={styles.content}>
      <RSkeleton className={styles.profileCard} radius="md" variant="surface">
        <div className={styles.profileSection}>
          <RSkeleton radius="none" className={styles.profileSectionTitle} />
          <div
            className={`${styles.profileField} ${styles.profileWalletField}`}
          >
            <RSkeleton radius="none" className={styles.profileLabel} />
            <RSkeleton className={styles.profileInput} radius="sm" />
          </div>
        </div>
        <div className={styles.profileSection}>
          <RSkeleton radius="none" className={styles.profileSectionTitle} />
          <div className={styles.profileGasRow}>
            <div className={styles.profileField}>
              <RSkeleton radius="none" className={styles.profileLabel} />
              <RSkeleton className={styles.profileInput} radius="sm" />
            </div>
            <RSkeleton height={47} radius="pill" width={83} />
          </div>
        </div>
      </RSkeleton>
    </div>
  );
}

const BODY_SKELETONS: Record<PortfolioPageSkeletonVariant, ComponentType> = {
  overview: OverviewSkeleton,
  activity: ActivitySkeleton,
  notifications: NotificationsSkeleton,
  profile: ProfileSkeleton,
  none: () => null,
};

// Shown while the stored auth session is being restored, so the page doesn't
// flash the "Log Into Your Account" state with a spinner. Every tab gets the
// shared header plus a body that mirrors that tab's layout.
// MobilePortfolio's first screen: the wallet address lookup form. Reuses its
// layout classes so the skeleton lines up with the form it crossfades into.
function MobileSkeleton() {
  return (
    <div className={mobileStyles.page}>
      <div className={mobileStyles.walletSearch}>
        <RSkeleton className={styles.mobileIntro} />
        <div className={mobileStyles.addressControls}>
          <div className={mobileStyles.addressField}>
            <RSkeleton className={styles.mobileLabel} />
            <RSkeleton className={styles.mobileInput} />
          </div>
          <RSkeleton className={styles.mobileButton} />
        </div>
      </div>
    </div>
  );
}

export function PortfolioPageSkeleton({
  variant,
}: {
  variant: PortfolioPageSkeletonVariant;
}) {
  const BodySkeleton = BODY_SKELETONS[variant];

  // The server can't tell a phone from a desktop, so both variants render and
  // CSS shows the one matching the viewport (same 820px as useIsMobileViewport)
  return (
    <div aria-busy="true" role="status">
      <div className={styles.mobileOnly}>
        <MobileSkeleton />
      </div>
      <div className={styles.desktopOnly}>
        <div className={welcomeStyles.wrapper}>
          <div className={welcomeStyles.welcome}>
            <RSkeleton
              radius="none"
              className={styles.welcomeTitle}
              variant="surface"
            />
            <div className={welcomeStyles.actions}>
              <RSkeleton
                height={45}
                radius="pill"
                variant="surface"
                width={121}
              />
              {/* Withdraw is 50px tall in the loaded header */}
              <RSkeleton
                height={50}
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
        <BodySkeleton />
      </div>
    </div>
  );
}
