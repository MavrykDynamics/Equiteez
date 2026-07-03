import type { HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

import styles from "./RMetricCard.module.css";

export type RMetricCardProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "children"
> & {
  label: ReactNode;
  value: ReactNode;
};

export function RMetricCard({
  className,
  label,
  value,
  ...props
}: RMetricCardProps) {
  return (
    <div className={clsx(styles.card, className)} {...props}>
      <dl className={styles.content}>
        <dt className={styles.label}>{label}</dt>
        <dd className={styles.value}>{value}</dd>
      </dl>
    </div>
  );
}
