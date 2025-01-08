import { EmblaOptionsType } from "embla-carousel";
import EmblaCarousel from "./EmblaCarousel";
import { getRestMockedEstates } from "~/providers/EstatesProvider/utils/estatesMocked";
import { ViewAll } from "./components/ViewAll";
import { SlidesNavigation } from "./components/SlidesNavigation";
import useEmblaCarousel from "embla-carousel-react";
import { usePrevNextButtons } from "~/lib/ui/use-embla-buttons";

// fake data
const fakeCardsRecord = getRestMockedEstates();
const fakeEstates = Object.values(fakeCardsRecord).slice(0, 10);
const fakeEstatesSecondary = Object.values(fakeCardsRecord).slice(10, 20);

const OPTIONS: EmblaOptionsType = { align: "start" };

export const PropertiesSlider = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel(OPTIONS);

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi);

  return (
    <div className="px-11 py-16 bg-green-main rounded-4xl">
      <h1 className="text-white text-section-headline max-w-[1017px] mb-6">
        Newly Listed
      </h1>
      <EmblaCarousel
        emblaRef={emblaRef}
        slides={fakeEstates}
        nextBtnDisabled={nextBtnDisabled}
        childPosition="before"
      >
        <div
          className={
            "w-full flex justify-between items-center mb-11 text-white"
          }
        >
          <ViewAll />
          <SlidesNavigation
            length={fakeEstates.length}
            onPrevButtonClick={onPrevButtonClick}
            onNextButtonClick={onNextButtonClick}
            prevBtnDisabled={prevBtnDisabled}
            nextBtnDisabled={nextBtnDisabled}
          />
        </div>
      </EmblaCarousel>
    </div>
  );
};

export const PropertiesSliderSecondary = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel(OPTIONS);

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi);

  return (
    <div className="flex flex-col gap-8 max-w-full">
      <h1 className="text-content text-section-headline font-bold w-full">
        Trending Assets
      </h1>
      <EmblaCarousel
        emblaRef={emblaRef}
        slides={fakeEstatesSecondary}
        nextBtnDisabled={nextBtnDisabled}
        childPosition="after"
      >
        <div className="w-full flex justify-end mt-8 text-content">
          <SlidesNavigation
            length={fakeEstatesSecondary.length}
            onPrevButtonClick={onPrevButtonClick}
            onNextButtonClick={onNextButtonClick}
            prevBtnDisabled={prevBtnDisabled}
            nextBtnDisabled={nextBtnDisabled}
            colorClassName="text-content"
          />
        </div>
      </EmblaCarousel>
    </div>
  );
};
