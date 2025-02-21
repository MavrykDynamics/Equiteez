import { memo, useEffect, useRef, useState } from "react";

import styles from "./banner.module.css";
import clsx from "clsx";
import useEmblaCarousel from "embla-carousel-react";
import {
  getItemFromStorage,
  setItemInStorage,
} from "~/lib/utils/local-storage";
import {
  BANNER_EMBLA_INTERVAL_TIME,
  BANNER_OFFSET_CLASSNAME,
  BANNER_VISIBILITY_VAR,
  DEFAULT_BANNER_TRANSITION_TIME,
  SECONDARY_HEADER_Y_OFFSET,
} from "./banner.consts";

import CrossIcon from "app/icons/cross.svg?react";
import { useTabActive } from "~/hooks/useIsTabActive";

type BannerContent = {
  id: string;
  content: string;
};

type BannerProps = {
  contantArr: BannerContent[];
};

export const Banner = memo(({ contantArr }: BannerProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    watchDrag: false,
  });

  const isFirstRun = useRef(true);
  const [activeBlockIdx, setActiveBlockIdx] = useState(0);

  const [isInRoundedMode, setIsInRoundedMode] = useState(false);
  const [isBannerSticky, setIsBannerSticky] = useState(() =>
    getItemFromStorage<boolean>(BANNER_VISIBILITY_VAR)
  );

  const [playAnimation, setPlayAnimation] = useState(false);

  const ref = useRef<HTMLDivElement | null>(null);

  const skipBanner = !contantArr.length;
  const isTabActive = useTabActive();

  useEffect(() => {
    if (skipBanner) return;
    if (contantArr.length > 1 && isTabActive) {
      const interval = setInterval(() => {
        setActiveBlockIdx((prev) =>
          prev === contantArr.length - 1 ? 0 : prev + 1
        );
      }, BANNER_EMBLA_INTERVAL_TIME);

      return () => {
        clearInterval(interval);
      };
    }
  }, [contantArr.length, skipBanner, isTabActive]);

  useEffect(() => {
    if (skipBanner) return;
    if (contantArr.length > 1 && isTabActive) {
      if (!emblaApi) return;
      if (isFirstRun.current) {
        isFirstRun.current = false;
        return;
      }

      emblaApi?.scrollNext();
    }
  }, [activeBlockIdx, contantArr.length, emblaApi, skipBanner, isTabActive]);

  useEffect(() => {
    if (skipBanner) return;
    const scrollContainer = window;

    const listenerCb = () => {
      const scrollOffest = (scrollContainer as Window).pageYOffset;
      const isBeyondOffset = scrollOffest > SECONDARY_HEADER_Y_OFFSET;

      if (isBannerSticky) {
        if (
          isBeyondOffset &&
          !ref.current?.classList.contains(BANNER_OFFSET_CLASSNAME)
        ) {
          ref.current?.classList.add(BANNER_OFFSET_CLASSNAME);
        } else if (
          scrollOffest < SECONDARY_HEADER_Y_OFFSET &&
          ref.current?.classList.contains(BANNER_OFFSET_CLASSNAME)
        ) {
          ref.current?.classList.remove(BANNER_OFFSET_CLASSNAME);
        }

        setIsInRoundedMode(isBeyondOffset);
      }
    };

    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", listenerCb);
    }

    return () => {
      scrollContainer.removeEventListener("scroll", listenerCb);
    };
  }, [skipBanner, isBannerSticky]);

  const handleBannerHideClick = () => {
    setPlayAnimation(true);
  };

  const handleHideAnimationEnd = () => {
    setPlayAnimation(false);
    setIsBannerSticky(false);
    setItemInStorage(BANNER_VISIBILITY_VAR, false);
  };

  if (skipBanner) return null;

  return (
    <div
      ref={ref}
      style={
        {
          "--timing": `${DEFAULT_BANNER_TRANSITION_TIME}ms`,
        } as React.CSSProperties
      }
      className={clsx(
        styles.bannerWrapper,
        isBannerSticky && styles.sticky,
        playAnimation && styles.hiding
      )}
      onAnimationEnd={handleHideAnimationEnd}
    >
      <div className={styles.embla__viewport} ref={emblaRef}>
        <div className={styles.embla__container}>
          {contantArr.map((item, idx) => (
            <div
              key={item.id}
              className={clsx(
                styles.embla__slide,
                idx !== activeBlockIdx && styles.hiddenBlock
              )}
            >
              <div className={clsx(" bg-[#BBA1D2] p-4 w-full text-center")}>
                <p className="text-content text-buttons">{item.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isInRoundedMode && (
        <button className={styles.crossBtn} onClick={handleBannerHideClick}>
          <CrossIcon className="size-6 text-white stroke-current" />
        </button>
      )}
    </div>
  );
});

Banner.displayName = "Banner";
