import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useLocation } from "@remix-run/react";
import clsx from "clsx";

import { RIcon } from "~/lib/atoms/RIcon";
import { usePrevNextButtons } from "~/lib/ui/use-embla-buttons";

import { AssetGalleryModal } from "./AssetGalleryModal";
import styles from "./AssetGallerySlider.module.css";

type AssetGallerySliderProps = {
  images: string[];
  name: string;
  size?: "compact" | "large";
};

export function AssetGallerySlider({
  images,
  name,
  size = "compact",
}: AssetGallerySliderProps) {
  const location = useLocation();
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    slidesToScroll: 1,
  });
  const {
    nextBtnDisabled,
    onNextButtonClick,
    onPrevButtonClick,
    prevBtnDisabled,
  } = usePrevNextButtons(emblaApi);
  useEffect(() => {
    setIsGalleryOpen(false);
  }, [location.pathname]);

  if (images.length === 0) return null;

  return (
    <section
      aria-label={`${name} gallery`}
      className={clsx(styles.slider, size === "large" && styles.large)}
    >
      <div className={styles.carouselRow}>
        <button
          aria-label="Previous gallery items"
          className={`${styles.arrowButton} ${styles.previousButton}`}
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
          className={`${styles.arrowButton} ${styles.nextButton}`}
          disabled={nextBtnDisabled}
          onClick={onNextButtonClick}
          type="button"
        >
          <RIcon name="arrow-short-right" size="medium" />
        </button>
      </div>

      <AssetGalleryModal
        images={images}
        isOpen={isGalleryOpen}
        name={name}
        onClose={() => setIsGalleryOpen(false)}
      />
    </section>
  );
}
