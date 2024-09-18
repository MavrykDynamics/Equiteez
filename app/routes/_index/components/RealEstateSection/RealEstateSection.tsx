import { Link } from '@remix-run/react';
import styles from './realEstate.module.css';

import estate1Src from 'app/assets/home/real-estate-1.webp';
import estate2Src from 'app/assets/home/real-estate-2.webp';
import estate3Src from 'app/assets/home/real-estate-3.webp';
import clsx from 'clsx';
import { forwardRef, useEffect, useMemo, useState } from 'react';
import { Container } from '~/lib/atoms/Container';
import ArrowRight from 'app/icons/arrow-right.svg?react';
import { Button } from '~/lib/atoms/Button';

import ReactCSSTransitionReplace from 'react-css-transition-replace';
import { useAppContext } from '~/providers/AppProvider/AppProvider';

const ESTATES = [
  {
    id: 1,
    imgSrc: estate1Src,
    title: (
      <>
        “Buying real estate has made me rich… <br />
        the most important decision I ever made <br />
        because it got me in the game.”
      </>
    ),
    author: '- Lana Rose, Real Estate Investor',
  },
  {
    id: 2,
    imgSrc: estate2Src,
    title: (
      <>
        “Buying real estate has made me rich… <br />
        the most important decision I ever made <br />
        because it got me in the game.”
      </>
    ),
    author: '- Lana Rose, Real Estate Investor',
  },
  {
    id: 3,
    imgSrc: estate3Src,
    title: (
      <>
        “Buying real estate has made me rich… <br />
        the most important decision I ever made <br />
        because it got me in the game.”
      </>
    ),
    author: '- Lana Rose, Real Estate Investor',
  },
];

const ESTATES_INTERVAL = 10000;

export const RealEstateSection = () => {
  const { IS_WEB } = useAppContext();
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlideIndex((prev) =>
        prev === ESTATES.length - 1 ? 0 : prev + 1
      );
    }, ESTATES_INTERVAL);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const estate = useMemo(() => ESTATES[activeSlideIndex], [activeSlideIndex]);

  return (
    <Container maxWidth={2304}>
      {IS_WEB ? (
        <ReactCSSTransitionReplace
          transitionName={'cross-fade'}
          transitionEnterTimeout={1000}
          transitionLeaveTimeout={1000}
        >
          <CurrentEstate estate={estate} key={estate.id} />
        </ReactCSSTransitionReplace>
      ) : null}
    </Container>
  );
};

const CurrentEstate = forwardRef<
  HTMLDivElement,
  { estate: (typeof ESTATES)[0] }
>(({ estate }, ref) => {
  return (
    <section ref={ref} className={clsx(styles.estateContainer)}>
      <div key={estate.id} className={clsx('w-full h-full relative')}>
        <img src={estate.imgSrc} alt="real estate" className={styles.fade} />
        <div
          className={clsx(
            styles.estateTextBlock,
            styles.fade,
            'flex flex-col items-start gap-y-6'
          )}
        >
          <h1 className="text-hero text-white">{estate.title}</h1>
          <div className="w-full flex items-end justify-between">
            <p className="text-buttons text-white">{estate.author}</p>
            <Link to={'/properties'}>
              <Button
                className="text-white bg-transparent border-2 border-white py-[8px]"
                variant="outline"
              >
                View properties
                <ArrowRight className="w-6 h-6 stroke-current ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
});

CurrentEstate.displayName = 'CurrentEstate';
