import { RSkeleton } from "~/lib/atoms/RSkeleton";
import { Container } from "~/lib/atoms/Container/Container";

import styles from "./styles.module.css";

const SECTIONS_COUNT = 3;
const CARDS_PER_SECTION = 3;

function HighlightCardSkeleton() {
  return (
    <RSkeleton className={styles.skeletonCard} radius="md" variant="surface">
      <RSkeleton className={styles.skeletonCardImage} radius="none" />
    </RSkeleton>
  );
}

const range = (length: number) => Array.from({ length }, (_, index) => index);

export function HighlightsSkeleton() {
  return (
    <Container className={styles.wrapper}>
      {range(SECTIONS_COUNT).map((section) => (
        <div className={styles.desktopSection} key={section}>
          <RSkeleton className={styles.skeletonTitle} variant="surface" />
          <div className={styles.sectionList}>
            {range(CARDS_PER_SECTION).map((card) => (
              <HighlightCardSkeleton key={card} />
            ))}
          </div>
        </div>
      ))}

      <div className={styles.mobileSections}>
        {range(SECTIONS_COUNT).map((section) => (
          <div className={styles.mobileSection} key={section}>
            <div className={styles.mobileSectionTitle}>
              <RSkeleton className={styles.skeletonTitle} variant="surface" />
            </div>
            <div className={styles.mobileViewport}>
              <div className={styles.mobileList}>
                {range(CARDS_PER_SECTION).map((card) => (
                  <div className={styles.mobileSlide} key={card}>
                    <HighlightCardSkeleton />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}
