import clsx from "clsx";

import styles from "./styles.module.css";
import type { RTextProps } from "./types";

export type { RTextProps } from "./types";

export function RText({
  children,
  className,
  size = "body-m",
  weight = "regular",
  color = "neutral-black",
  ...props
}: RTextProps) {
  return (
    <span
      {...props}
      className={clsx(
        styles.text,
        styles[size],
        styles[weight],
        styles[color],
        className
      )}
    >
      {children}
    </span>
  );
}
