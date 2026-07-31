import { RIcon } from "~/lib/atoms/RIcon";
import { RText } from "~/lib/atoms/RTypography/RText";

import styles from "./styles.module.css";

export function OpenOrdersLoadingState() {
  return (
    <section className={styles.state} aria-busy="true" aria-live="polite">
      <RIcon className={styles.loadingIcon} name="loading" />
      <RText color="neutral-600" size="body-sm">
        Loading orders…
      </RText>
    </section>
  );
}
