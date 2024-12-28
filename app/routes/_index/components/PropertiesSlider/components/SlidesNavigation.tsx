import { FC } from "react";
import { NextButton, PrevButton } from "~/templates/EmblaCarouselArrowButtons";
import { SLIDER_VIEW_LIMIT } from "../EmblaCarousel";

type SlidesNavigationProps = {
  length: number;
  onPrevButtonClick: () => void;
  onNextButtonClick: () => void;
  prevBtnDisabled: boolean;
  nextBtnDisabled: boolean;
  colorClassName?: string;
};

export const SlidesNavigation: FC<SlidesNavigationProps> = ({
  length,
  onPrevButtonClick,
  onNextButtonClick,
  prevBtnDisabled,
  nextBtnDisabled,
  colorClassName,
}) => {
  return (
    <div>
      {length > SLIDER_VIEW_LIMIT && (
        <div className="flex items-center gap-x-3 self-stretch">
          <PrevButton
            onClick={onPrevButtonClick}
            disabled={prevBtnDisabled}
            colorClassName={colorClassName}
          />
          <NextButton
            onClick={onNextButtonClick}
            disabled={nextBtnDisabled}
            colorClassName={colorClassName}
          />
        </div>
      )}
    </div>
  );
};
