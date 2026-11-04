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

const isShimmer = (animation: Animation): animation is CSSAnimation =>
  typeof CSSAnimation !== "undefined" &&
  animation instanceof CSSAnimation &&
  animation.animationName.includes("skeletonShimmer");

// One start time shared by every shimmer on the page
let shimmerStartTime: CSSNumberish | null = null;

// Adopt the phase of the shimmers already sweeping instead of picking a new
// one: server-rendered skeletons start animating before hydration, and
// re-pinning them on hydrate made every gradient jump mid-sweep.
function getShimmerStartTime() {
  if (shimmerStartTime === null) {
    const running = document
      .getAnimations()
      .find(
        (animation) => isShimmer(animation) && animation.startTime !== null
      );

    shimmerStartTime = running?.startTime ?? document.timeline.currentTime ?? 0;
  }

  return shimmerStartTime;
}

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

  // Pin the shimmer to one shared start time: every skeleton sweeps in sync,
  // and one that remounts (e.g. into the reveal overlay) keeps its phase
  // instead of restarting from the left edge.
  useIsomorphicLayoutEffect(() => {
    const animations = ref.current?.getAnimations?.({ subtree: true }) ?? [];
    const shimmers = animations.filter(isShimmer);

    if (!shimmers.length) return;

    const startTime = getShimmerStartTime();
    shimmers.forEach((animation) => {
      if (animation.startTime !== startTime) {
        animation.startTime = startTime;
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
