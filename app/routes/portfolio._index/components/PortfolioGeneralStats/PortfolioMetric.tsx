import { RSkeleton, RSkeletonReveal } from "~/lib/atoms/RSkeleton";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";
import type { RTypographyColor } from "~/lib/atoms/RTypography/types";

import styles from "./styles.module.css";

type PortfolioMetricProps = {
  color?: RTypographyColor;
  description: string;
  /** Swaps the value for a placeholder while its data is loading */
  isLoading?: boolean;
  label: string;
  value: React.ReactNode;
};

export function PortfolioMetric({
  color,
  description,
  isLoading = false,
  label,
  value,
}: PortfolioMetricProps) {
  return (
    <div className={styles.metric}>
      <RText color="neutral-700" size="body-s" weight="medium">
        {label}
      </RText>
      <RSkeletonReveal
        isLoading={isLoading}
        skeleton={
          <RSkeleton
            className={styles.skeletonMetricValue}
            radius="none"
            variant="surface"
          />
        }
      >
        <RHeading
          as="div"
          className={styles.value}
          color={color}
          size="h4"
          weight="medium"
        >
          {value}
        </RHeading>
      </RSkeletonReveal>
      <RText color="neutral-700" size="body-s">
        {description}
      </RText>
    </div>
  );
}
