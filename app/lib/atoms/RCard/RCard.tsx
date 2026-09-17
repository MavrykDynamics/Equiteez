import type { HTMLAttributes } from "react";
import clsx from "clsx";

import styles from "./RCard.module.css";

export type RCardTone = "dark" | "green" | "light";
export type RCardShape = "default" | "mock";
export type RCardShadow = "none" | "soft" | "strong";

export type RCardProps = HTMLAttributes<HTMLDivElement> & {
  hasShadow?: boolean;
  shadow?: RCardShadow;
  shape?: RCardShape;
  tone?: RCardTone;
};

export function RCard({
  children,
  className,
  hasShadow = false,
  shadow = "none",
  shape = "default",
  tone = "light",
  ...props
}: RCardProps) {
  const resolvedShadow = hasShadow && shadow === "none" ? "soft" : shadow;

  return (
    <div
      className={clsx(
        styles.card,
        styles[tone],
        styles[shape],
        resolvedShadow !== "none" && styles[`${resolvedShadow}Shadow`],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
