import clsx from "clsx";

import { RSkeleton } from "~/lib/atoms/RSkeleton";

import styles from "./styles.module.css";

const FILTER_TAB_WIDTHS = [73, 107, 93, 144, 125, 147];
const CARDS_COUNT = 12;

export function ExploreAssetsSkeleton() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.skeletonRow}>
        <RSkeleton height={32} variant="surface" width={304} />
        <RSkeleton
          className={styles.skeletonDesktopOnly}
          height={45}
          radius="pill"
          variant="surface"
          width={120}
        />
      </div>

      <div className={styles.skeletonMobileRow}>
        <RSkeleton
          className={styles.skeletonSearch}
          height={40}
          variant="surface"
        />
        <RSkeleton height={40} variant="surface" width={40} />
      </div>

      <div className={clsx(styles.skeletonRow, styles.skeletonDesktopOnly)}>
        <div className={styles.skeletonGroup}>
          {FILTER_TAB_WIDTHS.map((width, index) => (
            <RSkeleton
              height={37}
              key={index}
              radius="pill"
              variant="surface"
              width={width}
            />
          ))}
        </div>
        <div className={styles.skeletonControls}>
          <RSkeleton height={40} variant="surface" width={180} />
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
