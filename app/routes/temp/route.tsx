import type { MetaFunction } from '@remix-run/node';

// icons
import ArrowLeftIcon from 'app/icons/arrow-left.svg?react';
import LikeIcon from 'app/icons/like.svg?react';
import ShareIcon from 'app/icons/share.svg?react';
import CrossIcon from 'app/icons/cross.svg?react';

import clsx from 'clsx';

import styles from './route.module.css';
import CustomPopup from '~/organisms/CustomPopup/CustomPopup';
import { FC, useCallback, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { usePrevNextButtons } from '~/lib/ui/use-embla-buttons';
import { NextButton, PrevButton } from '~/templates/EmblaCarouselArrowButtons';

export const meta: MetaFunction = () => {
  return [{ title: 'temp' }, { name: 'description', content: 'Temp route!' }];
};

const fakeImages = [
  'https://images.pexels.com/photos/684812/pexels-photo-684812.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load',
  'https://images.pexels.com/photos/19879682/pexels-photo-19879682/free-photo-of-palm-in-front-of-modern-house-building.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  'https://images.pexels.com/photos/19846387/pexels-photo-19846387/free-photo-of-bedroom-with-a-dividing-wall.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  'https://images.pexels.com/photos/19846388/pexels-photo-19846388/free-photo-of-kitchen-with-white-cabinets-and-silver-appliances.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  'https://images.pexels.com/photos/19807271/pexels-photo-19807271/free-photo-of-contemporary-white-empty-kitchen-area-in-a-house.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  'https://images.pexels.com/photos/19879682/pexels-photo-19879682/free-photo-of-palm-in-front-of-modern-house-building.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  'https://images.pexels.com/photos/19846387/pexels-photo-19846387/free-photo-of-bedroom-with-a-dividing-wall.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  'https://images.pexels.com/photos/19846388/pexels-photo-19846388/free-photo-of-kitchen-with-white-cabinets-and-silver-appliances.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  'https://images.pexels.com/photos/19807271/pexels-photo-19807271/free-photo-of-contemporary-white-empty-kitchen-area-in-a-house.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
];

type GallerySliderProps = {
  handleClose: () => void;
};

const GallerySlider: FC<GallerySliderProps> = ({ handleClose }) => {
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
      <header className="flex items-center text-background">
        <button className="flex items-center gap-x-1" onClick={handleClose}>
          <CrossIcon className="w-6 h-6 text-background stroke-current" />
          <span className="text-buttons">Close</span>
        </button>
        <div className="flex items-center justify-center text-buttons flex-1">
          <span>{activeIndex}&nbsp;/&nbsp;</span>
          <span>{fakeImages.length - 1}</span>
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
                {fakeImages.map((img, idx) => (
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
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <section className={clsx('min-h-screen')}>
      <div className="mx-auto max-w-[1440px]">
        <header className="flex items-center justify-between px-11 pt-8">
          <button>
            <ArrowLeftIcon className="w-6 h-6 text-content stroke-current" />
          </button>
          <section className="flex items-center gap-x-4 ml-auto">
            <button className="text-content text-body flex items-center gap-x-1 font-semibold">
              <LikeIcon />
              <p>Save</p>
            </button>
            <button className="text-content text-body flex items-center gap-x-1 font-semibold">
              <ShareIcon />
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
            {fakeImages.map((img, idx) => (
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
        <GallerySlider handleClose={handleClose} />
      </CustomPopup>
    </section>
  );
}
