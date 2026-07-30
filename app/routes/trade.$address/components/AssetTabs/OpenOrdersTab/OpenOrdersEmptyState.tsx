import { RText } from "~/lib/atoms/RTypography/RText";

import styles from "./styles.module.css";

export function OpenOrdersEmptyState() {
  return (
    <section className={styles.state}>
      <RText size="body-m" weight="medium">
        No open orders
      </RText>
      <RText
        className={styles.stateDescription}
        color="neutral-600"
        size="body-sm"
      >
        Your active buy and sell orders for this asset will appear here.
      </RText>
    </section>
  );
}
