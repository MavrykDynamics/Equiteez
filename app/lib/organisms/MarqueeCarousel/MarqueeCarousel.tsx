import clsx from "clsx";
import { FC, PropsWithChildren } from "react";
import Marquee from "react-fast-marquee";

import styles from "./MarqueeCarousel.module.css";

type MarqueeCarouselProps = {
  autoFill?: boolean;
  className?: string;
  pauseOnHover?: boolean;
  play?: boolean;
  direction?: "left" | "right" | "up" | "down";
  speed?: number;
} & PropsWithChildren;

export const MarqueeCarousel: FC<MarqueeCarouselProps> = ({
  autoFill,
  className,
  pauseOnHover,
  play,
  direction,
  speed,
  children,
}) => {
  return (
    <div className={clsx(styles.root, className)}>
      <Marquee
        autoFill={autoFill}
        className={styles.marquee}
        play={play}
        pauseOnHover={pauseOnHover}
        direction={direction}
        speed={speed}
      >
        {children}
      </Marquee>
    </div>
  );
};
