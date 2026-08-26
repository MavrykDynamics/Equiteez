import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";

import styles from "./styles.module.css";

type PortfolioMetricProps = {
  description: string;
  label: string;
  value: React.ReactNode;
};

export function PortfolioMetric({
  description,
  label,
  value,
}: PortfolioMetricProps) {
  return (
    <div className={styles.metric}>
      <RText color="neutral-700" size="body-s" weight="medium">
        {label}
      </RText>
      <RHeading as="div" className={styles.value} size="h4" weight="medium">
        {value}
      </RHeading>
      <RText color="neutral-700" size="body-s">
        {description}
      </RText>
    </div>
  );
}
