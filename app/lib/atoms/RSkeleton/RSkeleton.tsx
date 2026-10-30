import type { CSSProperties, HTMLAttributes } from "react";
import clsx from "clsx";

import styles from "./RSkeleton.module.css";

// surface — cards, containers, section backgrounds (nest elements inside)
// element — text placeholders, icons, rows inside a surface
export type RSkeletonVariant = "surface" | "element";

export type RSkeletonRadius =
  | "none"
  | "xs"
  | "sm"
  | "12"
  | "md"
  | "lg"
  | "pill";

export type RSkeletonProps = HTMLAttributes<HTMLDivElement> & {
  variant?: RSkeletonVariant;
  radius?: RSkeletonRadius;
  width?: CSSProperties["width"];
  height?: CSSProperties["height"];
};

export function RSkeleton({
  variant = "element",
  radius = "sm",
  width,
  height,
  className,
  style,
  children,
  ...props
}: RSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={clsx(
        styles.skeleton,
        styles[variant],
        styles[`radius-${radius}`],
        className
      )}
      style={{ width, height, ...style }}
      {...props}
    >
      {children}
    </div>
  );
}
