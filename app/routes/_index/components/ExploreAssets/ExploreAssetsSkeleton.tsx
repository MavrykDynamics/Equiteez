import clsx from "clsx";

import { RSkeleton } from "~/lib/atoms/RSkeleton";

import styles from "./styles.module.css";

const FILTER_TAB_WIDTHS = [74, 109, 131, 110, 147, 145];
const CARDS_COUNT = 12;

export function ExploreAssetsSkeleton() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.skeletonHeader}>
        <div className={styles.skeletonRow}>
          <RSkeleton
            className={styles.skeletonTitle}
            variant="surface"
            width={304}
          />
          <RSkeleton
            className={styles.skeletonDesktopOnly}
            height={45}
            radius="pill"
            variant="surface"
            width={121}
          />
        </div>

        <div className={styles.skeletonMobileRow}>
          <RSkeleton
            className={styles.skeletonSearch}
            height={45}
            variant="surface"
          />
          <RSkeleton height={45} variant="surface" width={45} />
        </div>
      </div>

      <div className={clsx(styles.skeletonRow, styles.skeletonDesktopOnly)}>
        <div className={styles.skeletonGroup}>
          {FILTER_TAB_WIDTHS.map((width, index) => (
            <RSkeleton
              height={39}
              key={index}
              radius="pill"
              variant="surface"
              width={width}
            />
          ))}
        </div>
        <div className={styles.skeletonControls}>
          <RSkeleton height={45} variant="surface" width={45} />
          <RSkeleton height={42} variant="surface" width={181} />
          <RSkeleton height={40} variant="surface" width={104} />
        </div>
      </div>

      <div className={styles.skeletonGrid}>
        {Array.from({ length: CARDS_COUNT }, (_, index) => (
          <RSkeleton
            className={styles.skeletonCard}
            key={index}
            radius="none"
            variant="surface"
          >
            <RSkeleton className={styles.skeletonCardImage} radius="none" />
          </RSkeleton>
        ))}
      </div>
    </div>
  );
}
