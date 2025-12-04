import { EmblaOptionsType } from "embla-carousel";
import AssetsEmblaCarousel from "./AssetsEmblaCarousel";
import { ViewAll } from "./components/ViewAll";
import { SlidesNavigation } from "./components/SlidesNavigation";
import useEmblaCarousel from "embla-carousel-react";
import { usePrevNextButtons } from "~/lib/ui/use-embla-buttons";
import { useMarketsContext } from "~/providers/MarketsProvider/markets.provider";
import { useMemo } from "react";
import { ApiErrorBox } from "~/lib/organisms/ApiErrorBox/ApiErrorBox";
import styles from "./PropertiesSlider.module.css";
import { Container } from "~/lib/atoms/Container/Container";
import { AssetEmblaSlide } from "~/routes/_index/components/PropertiesSlider/components/AssetEmblaSlide";
import classNames from "clsx";

const OPTIONS: EmblaOptionsType = { align: "start" };

export const PropertiesSlider = () => {
  const { marketsArr, marketApiError } = useMarketsContext();

  const idxToSlice = useMemo(
    () => Math.ceil(marketsArr.length / 2),
    [marketsArr.length]
  );

  const slides = useMemo(
    () => marketsArr.slice(0, idxToSlice),
    [marketsArr, idxToSlice]
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(OPTIONS);

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi);

  if (!marketsArr.length) return null;

  return (
    <>
      <Container className={styles.desktopBlock}>
        <div className={styles.wrapper}>
          <div className={styles.titleBlock}>
            <h2 className={styles.title}>Newly Listed</h2>
            <div className={styles.btnBlock}>
              <ViewAll />
              <div className={styles.desktopBlock}>
                <SlidesNavigation
                  length={slides.length}
                  onPrevButtonClick={onPrevButtonClick}
                  onNextButtonClick={onNextButtonClick}
                  prevBtnDisabled={prevBtnDisabled}
                  nextBtnDisabled={nextBtnDisabled}
                />
              </div>
            </div>
          </div>

          {marketApiError ? (
            <ApiErrorBox message="The market data is unavailable at the moment" />
          ) : (
            <AssetsEmblaCarousel
              emblaRef={emblaRef}
              slides={slides}
              nextBtnDisabled={nextBtnDisabled}
              childPosition="before"
            >
              {null}
            </AssetsEmblaCarousel>
          )}
        </div>
      </Container>

      <div className={classNames(styles.wrapper, styles.tabletBlock)}>
        <Container>
          <div className={styles.titleBlock}>
            <h2 className={styles.title}>Newly Listed</h2>
            <div className={styles.btnBlock}>
              <ViewAll />
              <div className={styles.desktopBlock}>
                <SlidesNavigation
                  length={slides.length}
                  onPrevButtonClick={onPrevButtonClick}
                  onNextButtonClick={onNextButtonClick}
                  prevBtnDisabled={prevBtnDisabled}
                  nextBtnDisabled={nextBtnDisabled}
                />
              </div>
            </div>
          </div>
        </Container>

        {marketApiError ? (
          <Container>
            <ApiErrorBox message="The market data is unavailable at the moment" />
          </Container>
        ) : (
          <div className={classNames("remove-scrollbar", styles.mobileSlides)}>
            <div className="gap-4 flex w-fit">
              {slides.map((estate, idx) => (
                <div className="min-w-[292px]" key={estate.token_address}>
                  <AssetEmblaSlide
                    estate={estate}
                    idx={idx}
                    nextBtnDisabled={nextBtnDisabled}
                    assetsArrLength={slides.length}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export const PropertiesSliderSecondary = () => {
  const { marketsArr, marketApiError } = useMarketsContext();

  const idxToSlice = useMemo(
    () => Math.ceil(marketsArr.length / 2),
    [marketsArr.length]
  );

  const slides = useMemo(
    () => marketsArr.slice(0, idxToSlice),
    [marketsArr, idxToSlice]
  );
  const [emblaRef, emblaApi] = useEmblaCarousel(OPTIONS);

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi);

  return (
    <>
      <Container className={styles.desktopBlock}>
        <div className="flex flex-col gap-8 max-w-full">
          <h1 className="text-content text-section-headline font-bold w-full">
            Trending Assets
          </h1>
          {marketApiError ? (
            <ApiErrorBox message="The market data is unavailable at the moment" />
          ) : (
            <AssetsEmblaCarousel
              emblaRef={emblaRef}
              slides={slides}
              nextBtnDisabled={nextBtnDisabled}
              childPosition="after"
            >
              <div className="w-full flex justify-end mt-8 text-content">
                <SlidesNavigation
                  length={slides.length}
                  onPrevButtonClick={onPrevButtonClick}
                  onNextButtonClick={onNextButtonClick}
                  prevBtnDisabled={prevBtnDisabled}
                  nextBtnDisabled={nextBtnDisabled}
                  colorClassName="text-content"
                />
              </div>
            </AssetsEmblaCarousel>
          )}
        </div>
      </Container>
      <div className={classNames(styles.wrapper, styles.tabletBlock)}>
        <Container>
          <div className={styles.titleBlock}>
            <h2 className={styles.title}>Trending Assets</h2>
            <div className={styles.btnBlock}>
              <ViewAll />
            </div>
          </div>
        </Container>

        {marketApiError ? (
          <Container>
            <ApiErrorBox message="The market data is unavailable at the moment" />
          </Container>
        ) : (
          <div className={classNames("remove-scrollbar", styles.mobileSlides)}>
            <div className="gap-4 flex w-fit">
              {slides.map((estate, idx) => (
                <div className="min-w-[292px]" key={estate.token_address}>
                  <AssetEmblaSlide
                    estate={estate}
                    idx={idx}
                    nextBtnDisabled={nextBtnDisabled}
                    assetsArrLength={slides.length}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
