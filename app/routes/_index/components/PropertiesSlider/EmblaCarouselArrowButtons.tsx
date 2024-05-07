/* eslint-disable react/prop-types */
import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { EmblaCarouselType } from 'embla-carousel';

// icons
import ArrowRight from 'app/icons/chevron-right.svg?react';
import ArrowLeft from 'app/icons/chevron-left.svg?react';
import clsx from 'clsx';

type UsePrevNextButtonsType = {
  prevBtnDisabled: boolean;
  nextBtnDisabled: boolean;
  onPrevButtonClick: () => void;
  onNextButtonClick: () => void;
};

export const usePrevNextButtons = (
  emblaApi: EmblaCarouselType | undefined
): UsePrevNextButtonsType => {
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  const onPrevButtonClick = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollPrev();
  }, [emblaApi]);

  const onNextButtonClick = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect(emblaApi);
    emblaApi.on('reInit', onSelect);
    emblaApi.on('select', onSelect);
  }, [emblaApi, onSelect]);

  return {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  };
};

type PropType = PropsWithChildren<
  React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >
>;

export const PrevButton: React.FC<PropType> = (props) => {
  const { children, disabled, ...restProps } = props;

  return (
    <button
      className={clsx(
        'rounded-full overflow-hidden border-2 border-white w-11 h-11 flex items-center justify-center',
        disabled && 'opacity-50 pointer-events-none'
      )}
      type="button"
      {...restProps}
    >
      <ArrowLeft className="text-white stroke-current w-6 h-6" />
      {children}
    </button>
  );
};

export const NextButton: React.FC<PropType> = (props) => {
  const { children, disabled, ...restProps } = props;

  return (
    <button
      className={clsx(
        'rounded-full overflow-hidden border-2 border-white w-11 h-11 flex items-center justify-center',
        disabled && 'opacity-50 pointer-events-none'
      )}
      type="button"
      {...restProps}
    >
      <ArrowRight className="text-white stroke-current w-6 h-6" />
      {children}
    </button>
  );
};
