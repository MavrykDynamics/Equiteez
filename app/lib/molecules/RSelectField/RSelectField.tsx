import type { ReactNode } from "react";
import clsx from "clsx";

import { RIcon } from "~/lib/atoms/RIcon";

import styles from "./RSelectField.module.css";

export type RSelectFieldProps = {
  /** Leading icon, e.g. an `RTokenIcon` (32px in the design). */
  icon: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Opens the picker; without it the field is display-only (no chevron). */
  onClick?: () => void;
  disabled?: boolean;
  /** Muted title, for a placeholder such as "Select network". */
  isPlaceholder?: boolean;
  "aria-label"?: string;
  className?: string;
};

/** Full-width select trigger card: icon, title, subtitle and a chevron. */
export function RSelectField({
  icon,
  title,
  subtitle,
  onClick,
  disabled = false,
  isPlaceholder = false,
  "aria-label": ariaLabel,
  className,
}: RSelectFieldProps) {
  const content = (
    <>
      <span className={styles.icon}>{icon}</span>
      <span className={styles.copy}>
        <span
          className={styles.title}
          data-placeholder={isPlaceholder || undefined}
        >
          {title}
        </span>
        {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
      </span>
      {onClick && (
        <RIcon
          className={styles.chevron}
          name="arrow-short-down"
          size="small"
        />
      )}
    </>
  );

  return onClick ? (
    <button
      aria-haspopup="listbox"
      aria-label={ariaLabel}
      className={clsx(styles.field, styles.interactive, className)}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {content}
    </button>
  ) : (
    <div
      aria-label={ariaLabel}
      className={clsx(styles.field, className)}
      role={ariaLabel ? "group" : undefined}
    >
      {content}
    </div>
  );
}
