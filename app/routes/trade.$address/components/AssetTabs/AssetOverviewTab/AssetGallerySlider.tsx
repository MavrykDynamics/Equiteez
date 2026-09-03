import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useLocation } from "@remix-run/react";

import { RIcon } from "~/lib/atoms/RIcon";
import { usePrevNextButtons } from "~/lib/ui/use-embla-buttons";

import { AssetGalleryModal } from "./AssetGalleryModal";
import styles from "./AssetGallerySlider.module.css";

type AssetGallerySliderProps = {
  images: string[];
  name: string;
};

export function AssetGallerySlider({ images, name }: AssetGallerySliderProps) {
  const location = useLocation();
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    slidesToScroll: 1,
  });
  const {
    activeIndex,
    nextBtnDisabled,
    onNextButtonClick,
    onPrevButtonClick,
    prevBtnDisabled,
  } = usePrevNextButtons(emblaApi);
  const [snapCount, setSnapCount] = useState(1);

  useEffect(() => {
    if (!emblaApi) return;

    const setScrollSnapCount = () => {
      setSnapCount(emblaApi.scrollSnapList().length);
    };

    setScrollSnapCount();
    emblaApi.on("reInit", setScrollSnapCount);

    return () => {
      emblaApi.off("reInit", setScrollSnapCount);
    };
  }, [emblaApi]);

  useEffect(() => {
    setIsGalleryOpen(false);
  }, [location.pathname]);

  const handleDotClick = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
    },
    [emblaApi]
  );

  const hasMultiplePages = snapCount > 1;

  return (
    <section aria-label={`${name} gallery`} className={styles.slider}>
      <div className={styles.carouselRow}>
        <button
          aria-label="Previous gallery items"
          className={styles.arrowButton}
          disabled={prevBtnDisabled}
          onClick={onPrevButtonClick}
          type="button"
        >
          <RIcon name="arrow-short-left" size="medium" />
        </button>

        <div className={styles.viewport} ref={emblaRef}>
          <div className={styles.container}>
            {images.map((image, index) => (
              <div className={styles.slide} key={image}>
                <button
                  aria-label={`Open ${name}, view ${index + 1} in gallery`}
                  className={styles.imageButton}
                  onClick={() => setIsGalleryOpen(true)}
                  type="button"
                >
                  <img
                    alt={`${name}, view ${index + 1}`}
                    loading={index < 3 ? "eager" : "lazy"}
                    src={image}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          aria-label="Next gallery items"
          className={styles.arrowButton}
          disabled={nextBtnDisabled}
          onClick={onNextButtonClick}
          type="button"
        >
          <RIcon name="arrow-short-right" size="medium" />
        </button>
      </div>

      {hasMultiplePages ? (
        <div
          className={styles.dots}
          aria-label="Gallery pagination"
          role="tablist"
        >
          {Array.from({ length: snapCount }, (_, index) => (
            <button
              aria-label={`Show gallery items ${index + 1}`}
              aria-selected={activeIndex === index}
              className={styles.dot}
              key={index}
              onClick={() => handleDotClick(index)}
              role="tab"
              type="button"
            />
          ))}
        </div>
      ) : null}

      <AssetGalleryModal
        images={images}
        isOpen={isGalleryOpen}
        name={name}
        onClose={() => setIsGalleryOpen(false)}
      />
    </section>
  );
}
