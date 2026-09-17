import { RText } from "~/lib/atoms/RTypography/RText";

import styles from "./styles.module.css";

export function OpenOrdersEmptyState({
  title = "No Open Orders",
  description = "Your active buy and sell orders for this asset will appear here.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section className={styles.state}>
      <RText size="body-m" weight="medium">
        {title}
      </RText>
      <RText
        className={styles.stateDescription}
        color="neutral-600"
        size="body-sm"
      >
        {description}
      </RText>
    </section>
  );
}
