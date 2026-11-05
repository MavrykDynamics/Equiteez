import type { HTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

import { RIcon, type RIconName } from "~/lib/atoms/RIcon";

import styles from "./RAlert.module.css";

export type RAlertProps = Omit<HTMLAttributes<HTMLElement>, "title"> & {
  type?: "warning" | "error";
  // Without a header the body is the message itself and reads in black.
  header?: ReactNode;
  icon?: RIconName;
  children: ReactNode;
};

export function RAlert({
  type = "warning",
  header,
  icon,
  children,
  className,
  ...props
}: RAlertProps) {
  const hasHeader = header !== undefined && header !== null;

  return (
    <section
      {...props}
      className={clsx(
        styles.alert,
        styles[type],
        !hasHeader && styles.compact,
        className
      )}
    >
      <RIcon
        className={styles.icon}
        name={icon ?? "info"}
        size={hasHeader ? "medium" : "small"}
      />
      <div className={styles.content}>
        {hasHeader && <span className={styles.header}>{header}</span>}
        <span className={styles.description}>{children}</span>
      </div>
    </section>
  );
}
