import React, { useEffect, useMemo, useState } from 'react';
import { SwitchTransition, CSSTransition } from 'react-transition-group';
import styles from './realEstate.module.css';
import { Button } from '~/lib/atoms/Button';

// assets
import estate1Src from 'app/assets/home/real-estate-1.webp';
import estate2Src from 'app/assets/home/real-estate-2.webp';
import estate3Src from 'app/assets/home/real-estate-3.webp';
import ArrowRight from 'app/icons/arrow-right.svg?react';
import clsx from 'clsx';
import { Link } from '@remix-run/react';

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
    author: '- Barbera Corcoran, Shark Tank Investor',
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
    author: '- Barbera Corcoran, Shark Tank Investor 2',
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
    author: '- Barbera Corcoran, Shark Tank Investor 3',
  },
];

const ESTATES_INTERVAL = 4000;

export const RealEstateSection = () => {
  const nodeRef = React.useRef(null);

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
    <section className={clsx(styles.estateContainer)}>
      <SwitchTransition mode="out-in">
        <CSSTransition
          key={estate.id}
          nodeRef={nodeRef}
          addEndListener={(done: () => void) => {
            nodeRef?.current.addEventListener('transitionend', done, false);
          }}
          classNames={{
            enter: styles['fade-enter'],
            enterActive: styles['fade-enter-active'],
            exit: styles['fade-exit'],
            exitActive: styles['fade-exit-active'],
          }}
        >
          <div ref={nodeRef}>
            <div className={clsx('w-full h-full relative', styles.estate)}>
              <img src={estate.imgSrc} alt="real estate" />
              <div
                className={clsx(
                  styles.estateTextBlock,
                  'flex flex-col items-start gap-y-6'
                )}
              >
                <h1 className={clsx('text-hero text-white')}>{estate.title}</h1>
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
          </div>
        </CSSTransition>
      </SwitchTransition>
    </section>
  );
};
