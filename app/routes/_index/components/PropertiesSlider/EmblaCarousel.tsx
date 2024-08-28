import React from 'react';
import { EmblaOptionsType } from 'embla-carousel';
import {
  PrevButton,
  NextButton,
} from 'app/templates/EmblaCarouselArrowButtons';
import useEmblaCarousel from 'embla-carousel-react';

// icons
import ArrowRight from 'app/icons/arrow-right.svg?react';

import styles from './embla.module.css';
import clsx from 'clsx';
import { Button } from '~/lib/atoms/Button';
import { Link, useNavigate } from '@remix-run/react';
import {
  PrimaryEstate,
  SECONDARY_MARKET,
  SecondaryEstate,
} from '~/providers/EstatesProvider/estates.types';
import { usePrevNextButtons } from '~/lib/ui/use-embla-buttons';
import { ThumbCardSecondary } from '~/templates/ThumbCard/ThumbCard';

type PropType = {
  slides: (PrimaryEstate | SecondaryEstate)[];
  options?: EmblaOptionsType;
};

const EmblaCarousel: React.FC<PropType> = (props) => {
  const { slides, options } = props;
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  const navigate = useNavigate();

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi);

  const handleSlideClick = (id: string, isLastSlide: boolean) => {
    if (isLastSlide) return;
    navigate(`/properties/${id}`);
  };

  return (
    <section className={styles.embla}>
      <div className={'w-full flex justify-between items-center mb-11'}>
        <Link to={'/properties'}>
          <Button
            variant="custom"
            className="text-white bg-transparent border-2 border-white py-[8px]"
          >
            <div className="flex items-center gap-2">
              View All
              <ArrowRight className="w-6 h-6 stroke-current" />
            </div>
          </Button>
        </Link>
        <div className="flex items-center gap-x-3">
          <PrevButton onClick={onPrevButtonClick} disabled={prevBtnDisabled} />
          <NextButton onClick={onNextButtonClick} disabled={nextBtnDisabled} />
        </div>
      </div>
      <div className={styles.embla__viewport} ref={emblaRef}>
        <div className={styles.embla__container}>
          {slides.map((estate, idx) => {
            const isSecondaryMarket =
              estate.assetDetails.type === SECONDARY_MARKET;

            const restProps = isSecondaryMarket
              ? {
                  pricePerToken: (estate as SecondaryEstate).assetDetails
                    .priceDetails.price,
                }
              : {
                  // For the time being for fake data
                  progressBarPercentage: +(
                    (((estate as PrimaryEstate).assetDetails.priceDetails
                      .tokensUsed || 1) /
                      (estate as PrimaryEstate).assetDetails.priceDetails
                        .tokensAvailable) *
                    100
                  ).toFixed(2),
                };
            return (
              <div
                role="presentation"
                className={clsx(styles.embla__slide, 'cursor-pointer')}
                key={estate.token_address}
                onClick={() =>
                  handleSlideClick(
                    estate.assetDetails.blockchain[0].identifier,
                    idx === slides.length - 1
                  )
                }
              >
                {nextBtnDisabled && idx === slides.length - 1 ? (
                  <div className={styles.embla__slide__number}>
                    <img
                      src={estate.assetDetails.previewImage}
                      alt="house"
                      className={styles.embla__slide__image}
                    />
                    <div
                      className={clsx(
                        styles.lastSlide,
                        'flex items-center justify-center'
                      )}
                    >
                      <div className="flex flex-col items-center gap-y-6">
                        <h4 className="text-white text-card-headline text-center">
                          Want to see more? <br />
                          Check out our marketplace
                        </h4>
                        <Link to="/properties">
                          <Button variant="white">Explore</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : (
                  <ThumbCardSecondary
                    height={'281px'}
                    imgSrc={estate.assetDetails.previewImage}
                    title={estate.name}
                    description={
                      estate.assetDetails.propertyDetails.propertyType
                    }
                    isSecondaryMarket={isSecondaryMarket}
                    APY={estate.assetDetails.APY}
                    {...restProps}
                  />
                )}

                {/* <div className={styles.embla__slide__number}>
                <img
                  src={estate.assetDetails.previewImage}
                  alt="house"
                  className={styles.embla__slide__image}
                />

                {nextBtnDisabled && idx === slides.length - 1 ? (
                  <div
                    className={clsx(
                      styles.lastSlide,
                      'flex items-center justify-center'
                    )}
                  >
                    <div className="flex flex-col items-center gap-y-6">
                      <h4 className="text-white text-card-headline text-center">
                        Want to see more? <br />
                        Check out our marketplace
                      </h4>
                      <Link to="/properties">
                        <Button variant="white">Explore</Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div
                    className={clsx(
                      styles.embla__slide__content,
                      'flex flex-col justify-end'
                    )}
                  >
                    <div className="px-4 pb-4 flex gap-x-4 justify-between">
                      <div className="flex flex-col items-start">
                        <h4 className="text-white text-slider-headline truncate max-w-[300px]">
                          {estate.name}
                        </h4>
                        <p className="text-white text-body-xs">
                          {estate.assetDetails.propertyDetails.fullAddress}
                        </p>
                      </div>

                      <div className="flex flex-col items-end">
                        <h4 className="text-white text-slider-headline truncate max-w-[300px]">
                          {estate.assetDetails.APY}%
                        </h4>
                        <p className="text-white text-body-xs">APY</p>
                      </div>
                    </div>
                  </div>
                )}
              </div> */}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default EmblaCarousel;
