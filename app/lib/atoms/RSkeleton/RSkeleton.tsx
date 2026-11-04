import {
  type CSSProperties,
  type HTMLAttributes,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import clsx from "clsx";

import styles from "./RSkeleton.module.css";

// useLayoutEffect warns during SSR (React 18)
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

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
  const ref = useRef<HTMLDivElement>(null);

  // Pin the shimmer to the document timeline: every skeleton sweeps in sync,
  // and one that remounts (e.g. into the reveal overlay) keeps its phase
  // instead of restarting from the left edge.
  useIsomorphicLayoutEffect(() => {
    const animations = ref.current?.getAnimations?.({ subtree: true }) ?? [];
    animations.forEach((animation) => {
      if (
        typeof CSSAnimation !== "undefined" &&
        animation instanceof CSSAnimation &&
        animation.animationName.includes("skeletonShimmer")
      ) {
        animation.startTime = 0;
      }
    });
  }, []);

  return (
    <div
      ref={ref}
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
