import styles from './realEstate.module.css';

import estate1Src from 'app/assets/home/real-estate-1.webp';
import estate2Src from 'app/assets/home/real-estate-2.webp';
import estate3Src from 'app/assets/home/real-estate-3.webp';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { LinkWithIcon } from '~/lib/atoms/LinkWithIcon';

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
        “(2)Buying real estate has made me rich… <br />
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
        “(3)Buying real estate has made me rich… <br />
        the most important decision I ever made <br />
        because it got me in the game.”
      </>
    ),
    author: '- Barbera Corcoran, Shark Tank Investor 3',
  },
];

const ESTATES_INTERVAL = 10000;

export const RealEstateSection = () => {
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

  return (
    <section className={clsx(styles.estateContainer)}>
      {ESTATES.map((estate, idx) => (
        <div
          key={estate.id}
          className={clsx(
            idx !== activeSlideIndex && 'hidden',
            'w-full h-full relative'
          )}
        >
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
              <LinkWithIcon to={'/properties'}>View properties</LinkWithIcon>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
};
