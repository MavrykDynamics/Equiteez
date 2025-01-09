import { FC } from "react";
import Marquee from "react-fast-marquee";

type MarqueeCarouselProps = {
  autoFill?: boolean;
  pauseOnHover?: boolean;
  play?: boolean;
  direction?: "left" | "right" | "up" | "down";
  speed?: number;
} & PropsWithChildren;

export const MarqueeCarousel: FC<MarqueeCarouselProps> = ({
  autoFill,
  play,
  direction,
  speed,
  children,
}) => {
  return (
    <div className={"flex overflow-hidden flex-nowrap"}>
      <Marquee
        autoFill={autoFill}
        play={play}
        direction={direction}
        speed={speed}
      >
        {children}
      </Marquee>
    </div>
  );
};
