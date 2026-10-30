import { type ReactNode, useEffect, useState } from "react";
import clsx from "clsx";

import styles from "./RSkeleton.module.css";

export type RSkeletonRevealProps = {
  children: ReactNode;
  className?: string;
  isLoading: boolean;
  skeleton: ReactNode;
};

// Shows `skeleton` while loading, then wipes the content in. Content that is
// ready on mount (e.g. cached data) renders straight away without the wipe.
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

  return (
    <div
      className={clsx(
        (isRevealing || hasShownSkeleton) && styles.reveal,
        className
      )}
      // The mask clips overflow (dropdowns, tooltips), so drop it once done
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget) {
          setIsRevealing(false);
        }
      }}
    >
      {children}
    </div>
  );
}
