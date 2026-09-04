import { RLogo } from "~/lib/atoms/RLogo";
import { RText } from "~/lib/atoms/RTypography/RText";

import styles from "./MobileLayout.module.css";

export function MobileLayout() {
  return (
    <div className={styles.mobileLayout}>
      <header className={styles.header}>
        <RLogo size="medium" tone="black" />
      </header>

      <main className={styles.content}>
        <div className={styles.message}>
          <RText size="body-l" weight="medium">
            Mobile version is not available yet.
          </RText>
          <RText color="neutral-700" size="body-m">
            Please open Equiteez on a desktop screen to continue.
          </RText>
        </div>
      </main>

      <footer className={styles.footer}>
        <RText color="neutral-700" size="body-s">
          Copyright 2026 Equiteez
        </RText>
      </footer>
    </div>
  );
}
