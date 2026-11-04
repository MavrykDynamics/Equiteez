import { type ReactNode, useEffect, useState } from "react";
import clsx from "clsx";

import styles from "./RSkeleton.module.css";

// The overlay sits fully opaque until the browser has actually painted a frame
// with the content under it, and only then starts fading. Heavy mounts (charts,
// tables) block the main thread for a while; a fade that started on creation
// would be mostly over by the first visible frame and look like a hard swap.
function RevealSkeletonOverlay({
  children,
  onDone,
}: {
  children: ReactNode;
  onDone: () => void;
}) {
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => setIsFading(true));
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      aria-hidden="true"
      className={clsx(
        styles.revealSkeleton,
        isFading && styles.revealSkeletonFading
      )}
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget) {
          onDone();
        }
      }}
    >
      {children}
    </div>
  );
}

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
    <div className={clsx(isCrossfading && styles.reveal, className)}>
      {children}
      {isCrossfading && skeleton && (
        <RevealSkeletonOverlay onDone={() => setIsRevealing(false)}>
          {skeleton}
        </RevealSkeletonOverlay>
      )}
    </div>
  );
}
