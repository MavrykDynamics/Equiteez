import type { HTMLAttributes } from "react";
import clsx from "clsx";

import styles from "./RChip.module.css";

export type RChipTone = "glass" | "green" | "white";

export type RChipProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: RChipTone;
};

export function RChip({
  children,
  className,
  tone = "green",
  ...props
}: RChipProps) {
  return (
    <span className={clsx(styles.chip, styles[tone], className)} {...props}>
      {children}
    </span>
  );
}
