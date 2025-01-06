import { FC, useEffect } from "react";
import { NextButton, PrevButton } from "~/templates/EmblaCarouselArrowButtons";

// hooks
import useEmblaCarousel from "embla-carousel-react";
import { usePrevNextButtons } from "~/lib/ui/use-embla-buttons";

// icons
import LikeIcon from "app/icons/like.svg?react";
import ShareIcon from "app/icons/share.svg?react";
import CrossIcon from "app/icons/cross.svg?react";

// styles
import styles from "../route.module.css";
import clsx from "clsx";

type GallerySliderProps = {
  handleClose: () => void;
  images: string[];
  pickedImgIdx: number;
};

const GallerySlider: FC<GallerySliderProps> = ({
  handleClose,
  images,
  pickedImgIdx,
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start" });

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
    activeIndex,
  } = usePrevNextButtons(emblaApi);

  useEffect(() => {
    emblaApi?.scrollTo(pickedImgIdx, true);
  }, [pickedImgIdx, emblaApi]);

  return (
    <div className="h-full">
      <header className="flex items-center text-background relative">
        <button className="flex items-center gap-x-1" onClick={handleClose}>
          <CrossIcon className="w-6 h-6 text-background stroke-current" />
          <span className="text-buttons">Close</span>
        </button>
        <div
          className={clsx(
            "flex items-center justify-center text-buttons flex-1",
            styles.counter
          )}
        >
          <span>{activeIndex + 1}&nbsp;/&nbsp;</span>
          <span>{images.length}</span>
        </div>

        <section className="flex items-center gap-x-4 ml-auto">
          <button className="text-white text-body flex items-center gap-x-1 font-semibold">
            <LikeIcon className="stroke-current" />
            <p>Save</p>
          </button>
          <button className="text-white text-body flex items-center gap-x-1 font-semibold">
            <ShareIcon className="stroke-current" />
            <p>Share</p>
          </button>
        </section>
      </header>
      <div
        className={clsx(
          "flex flex-col justify-center h-full mt-11",
          styles["no-select"]
        )}
      >
        <div className="flex items-center justify-center">
          <div className="mr-[70px]">
            <PrevButton
              onClick={onPrevButtonClick}
              disabled={prevBtnDisabled}
            />
          </div>
          <section className={styles.embla}>
            <div ref={emblaRef} className={styles.embla__viewport}>
              <div className={styles.embla__container}>
                {images.map((img, idx) => (
                  <div key={idx} className={styles.embla__slide}>
                    <img src={img} alt={"slider item"} />
                  </div>
                ))}
              </div>
            </div>
          </section>
          <div className="ml-[70px]">
            <NextButton
              onClick={onNextButtonClick}
              disabled={nextBtnDisabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GallerySlider;
