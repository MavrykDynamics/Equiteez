import type { MetaFunction } from '@remix-run/node';
import { FC, useCallback, useMemo, useState } from 'react';
import clsx from 'clsx';

// icons
import ArrowLeftIcon from 'app/icons/arrow-left.svg?react';
import LikeIcon from 'app/icons/like.svg?react';
import ShareIcon from 'app/icons/share.svg?react';
import CrossIcon from 'app/icons/cross.svg?react';

// styles
import styles from './route.module.css';

// components
import CustomPopup from '~/lib/organisms/CustomPopup/CustomPopup';
import { NextButton, PrevButton } from '~/templates/EmblaCarouselArrowButtons';

// hooks
import useEmblaCarousel from 'embla-carousel-react';
import { usePrevNextButtons } from '~/lib/ui/use-embla-buttons';
import { usePropertyByAddress } from '../properties.$id/hooks/use-property-by-id';
import { Link } from '@remix-run/react';
import { FullScreenSpinner } from '~/lib/atoms/Spinner/Spinner';

export const meta: MetaFunction = () => {
  return [
    { title: 'Gallery' },
    { name: 'description', content: 'Estate gallery' },
  ];
};

type GallerySliderProps = {
  handleClose: () => void;
  images: string[];
};

const GallerySlider: FC<GallerySliderProps> = ({ handleClose, images }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start' });

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
    activeIndex,
  } = usePrevNextButtons(emblaApi);

  return (
    <div className="h-full">
      <header className="flex items-center text-background relative">
        <button className="flex items-center gap-x-1" onClick={handleClose}>
          <CrossIcon className="w-6 h-6 text-background stroke-current" />
          <span className="text-buttons">Close</span>
        </button>
        <div
          className={clsx(
            'flex items-center justify-center text-buttons flex-1',
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
          'flex flex-col justify-center h-full mt-11',
          styles['no-select']
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
                    <img src={img} alt={'slider item'} />
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

export default function Index() {
  const estateData = usePropertyByAddress('estateId');
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const images = useMemo(
    () =>
      estateData
        ? [
            estateData.assetDetails.previewImage,
            ...estateData.assetDetails.assetImages,
          ]
        : [],
    [estateData]
  );

  if (!estateData) return <FullScreenSpinner />;

  return (
    <section className={clsx('min-h-screen')}>
      <div className="mx-auto max-w-[1440px]">
        <header className="flex items-center justify-between px-11 pt-8">
          <Link
            to={`/properties/${estateData.assetDetails.blockchain[0].identifier}`}
          >
            <button>
              <ArrowLeftIcon className="w-6 h-6 text-content stroke-current" />
            </button>
          </Link>
          <section className="flex items-center gap-x-4 ml-auto">
            <button className="text-content text-body flex items-center gap-x-1 font-semibold">
              <LikeIcon className="stroke-current" />
              <p>Save</p>
            </button>
            <button className="text-content text-body flex items-center gap-x-1 font-semibold">
              <ShareIcon className="stroke-current" />
              <p>Share</p>
            </button>
          </section>
        </header>
        <div className="max-w-[894px] mx-auto mt-16 mb-[120px]">
          <div
            role="presentation"
            className={clsx(styles.gallery, 'cursor-pointer')}
            onClick={handleOpen}
          >
            {images.map((img, idx) => (
              <div
                key={idx}
                className={clsx(
                  styles.galleryItem,
                  'bg-green-opacity overflow-hidden'
                )}
              >
                <img src={img} alt="gallery item" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <CustomPopup
        isOpen={isOpen}
        contentPosition={'center'}
        shouldCloseOnEsc
        shouldFocusAfterRender={false}
        className={clsx(
          'w-full h-full relative bg-black-secondary rounded-none px-11 py-8'
        )}
      >
        <GallerySlider handleClose={handleClose} images={images} />
      </CustomPopup>
    </section>
  );
}
