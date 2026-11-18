import { RSkeleton } from "~/lib/atoms/RSkeleton";

import styles from "./styles.module.css";

const SKELETON_DOTS_COUNT = 2;

export function BannerBlockSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading featured opportunities"
      className={styles.banner}
    >
      <div className={styles.viewport}>
        <RSkeleton
          className={styles.skeletonSlide}
          radius="lg"
          variant="surface"
        />
      </div>
      <div aria-hidden="true" className={styles.pagination}>
        {Array.from({ length: SKELETON_DOTS_COUNT }, (_, index) => (
          <span className={styles.skeletonDot} key={index} />
        ))}
      </div>
    </div>
  );
}
