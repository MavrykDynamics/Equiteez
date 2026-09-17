import type { HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

import { RIcon } from "~/lib/atoms/RIcon";

import styles from "./RAlert.module.css";

export type RAlertProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  type?: "warning" | "error";
  header: ReactNode;
  children: ReactNode;
};

export function RAlert({
  type = "warning",
  header,
  children,
  className,
  ...props
}: RAlertProps) {
  return (
    <section {...props} className={clsx(styles.alert, styles[type], className)}>
      <RIcon className={styles.icon} name="info" size="medium" />
      <div className={styles.content}>
        <span className={styles.header}>{header}</span>
        <span className={styles.description}>{children}</span>
      </div>
    </section>
  );
}
