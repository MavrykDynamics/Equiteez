import { type ReactNode, useEffect, useState } from "react";
import clsx from "clsx";

import styles from "./RSkeleton.module.css";

export type RSkeletonRevealProps = {
  children: ReactNode;
  className?: string;
  isLoading: boolean;
  skeleton: ReactNode;
};

// Shows `skeleton` while loading, then crossfades it into the content
// (popLayout-style): the content takes over the layout straight away while the
// skeleton is popped into an overlay on top of it that fades out, so there is
// never a frame with neither on screen. Content that is ready on mount (e.g.
// cached data) renders straight away without the crossfade.
export function RSkeletonReveal({
  children,
  className,
  isLoading,
  skeleton,
}: RSkeletonRevealProps) {
  const [hasShownSkeleton, setHasShownSkeleton] = useState(isLoading);
  const [isRevealing, setIsRevealing] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setHasShownSkeleton(true);
    } else if (hasShownSkeleton) {
      setHasShownSkeleton(false);
      setIsRevealing(true);
    }
  }, [hasShownSkeleton, isLoading]);

  if (isLoading) {
    return <>{skeleton}</>;
  }

  // True from the first loaded render, before the effect above flips state
  const isCrossfading = isRevealing || hasShownSkeleton;

  return (
    <div
      className={clsx(isCrossfading && styles.reveal, className)}
    >
      {children}
      {isCrossfading && skeleton && (
        <div
          aria-hidden="true"
          className={styles.revealSkeleton}
          onAnimationEnd={(event) => {
            if (event.target === event.currentTarget) {
              setIsRevealing(false);
            }
          }}
        >
          {skeleton}
        </div>
      )}
    </div>
  );
}
