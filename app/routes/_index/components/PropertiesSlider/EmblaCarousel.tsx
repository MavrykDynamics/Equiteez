import React from 'react';
import { EmblaOptionsType } from 'embla-carousel';
import {
  PrevButton,
  NextButton,
  usePrevNextButtons,
} from './EmblaCarouselArrowButtons';
import useEmblaCarousel from 'embla-carousel-react';

import styles from './embla.module.css';
import { EstateType } from '~/mocks/estates.type';
import clsx from 'clsx';

type PropType = {
  slides: EstateType[];
  options?: EmblaOptionsType;
};

const EmblaCarousel: React.FC<PropType> = (props) => {
  const { slides, options } = props;
  const [emblaRef, emblaApi] = useEmblaCarousel(options);

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi);

  return (
    <section className={styles.embla}>
      <div className={styles.embla__controls}>
        <div className={styles.embla__buttons}>
          <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
          <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
        </div>
      </div>
      <div className={styles.embla__viewport} ref={emblaRef}>
        <div className={styles.embla__container}>
          {slides.map((estate) => (
            <div className={styles.embla__slide} key={estate.imgSrc}>
              <div className={styles.embla__slide__number}>
                <img
                  src={estate.imgSrc}
                  alt="house"
                  className={styles.embla__slide__image}
                />
                <div
                  className={clsx(
                    styles.embla__slide__content,
                    'flex flex-col justify-end'
                  )}
                >
                  <div className="px-4 pb-4 flex gap-x-4 justify-between">
                    <div className="flex flex-col items-start">
                      <h4 className="text-white text-slider-headline truncate max-w-[300px]">
                        {estate.title}
                      </h4>
                      <p className="text-white text-body-xs">
                        {estate.details.fullAddress}
                      </p>
                    </div>

                    <div className="flex flex-col items-start">
                      <h4 className="text-white text-slider-headline truncate max-w-[300px]">
                        {estate.details.APY}%
                      </h4>
                      <p className="text-white text-body-xs">APY</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EmblaCarousel;
