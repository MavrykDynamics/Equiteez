import { CSSProperties, FC, useMemo } from 'react';

import styles from './thumbCard.module.css';
import clsx from 'clsx';
import { EstateHeadlineTab } from '../EstateHeadlineTab';

type ThumbCardProps = {
  imgSrc: string;
  title: string;
  address: string;
  APY: number;
  height?: string;
};

export const ThumbCard: FC<ThumbCardProps> = ({
  imgSrc,
  title,
  address,
  APY,
  height = '301px',
}) => {
  const memoizedStyle = useMemo(() => ({ '--card-height': height }), [height]);

  return (
    <div
      style={memoizedStyle as React.CSSProperties}
      className={styles.thumbCardWrapper}
    >
      <img src={imgSrc} alt="house" className={styles.thumbCardImg} />
      <div
        className={clsx(styles.thumbCardContent, 'flex flex-col justify-end')}
      >
        <div className="px-4 pb-4 flex gap-x-4 justify-between">
          <div className="flex flex-col items-start">
            <h4 className="text-white text-slider-headline truncate max-w-[300px]">
              {title}
            </h4>
            <p className="text-white text-body-xs">{address}</p>
          </div>

          <div className="flex flex-col items-end">
            <h4 className="text-white text-slider-headline truncate max-w-[300px]">
              {APY}%
            </h4>
            <p className="text-white text-body-xs">APY</p>
          </div>
        </div>
      </div>
    </div>
  );
};

type ThumbCardSecondary = Omit<ThumbCardProps, 'address'> & {
  description: string;
  progressBarPercentage?: number;
  isSecondaryMarket: boolean;
  pricePerToken?: number;
};

export const ThumbCardSecondary: FC<ThumbCardSecondary> = ({
  imgSrc,
  title,
  description,
  isSecondaryMarket,
  pricePerToken,
  progressBarPercentage,
  APY,
  height = '264px',
}) => {
  const memoizedStyle = useMemo(() => ({ '--card-height': height }), [height]);

  return (
    <div
      style={memoizedStyle as React.CSSProperties}
      className={styles.thumbCardWrapper}
    >
      <img src={imgSrc} alt="house" className={styles.thumbCardImg} />
      <div
        className={clsx(
          styles.thumbCardContent,
          'flex flex-col justify-between p-4'
        )}
      >
        <div className="flex items-center gap-x-2">
          <EstateHeadlineTab isSecondaryEstate={isSecondaryMarket} />
        </div>
        <div className="flex flex-col items-start">
          <div className="flex-1 w-full flex justify-between">
            <div className="flex flex-col">
              <h4 className="text-white text-slider-headline truncate max-w-[381px]">
                {title}
              </h4>
              <p className="text-white text-body-xs leading-5">{description}</p>
            </div>
            <div className="flex">
              {pricePerToken && (
                <div className="flex flex-col items-center pr-3 border-r border-sand-50 mr-3">
                  <span className="text-card-headline text-sand-50">
                    ${pricePerToken}
                  </span>
                  <span className="text-sand-50 text-body-xs leading-5">
                    Price
                  </span>
                </div>
              )}
              <div className="flex flex-col items-center">
                <span className="text-card-headline text-sand-50">{APY}%</span>
                <span className="text-sand-50 text-body-xs leading-5">APY</span>
              </div>
            </div>
          </div>
          {progressBarPercentage && (
            <div
              style={
                {
                  '--percentage': `${progressBarPercentage}%`,
                } as CSSProperties
              }
              className={clsx(
                styles.progressBarContainer,
                'gap-x-2 w-full items-center'
              )}
            >
              <div
                className={clsx(
                  'overflow-hidden',
                  styles.progressBar,
                  styles.progressPercentage,
                  progressBarPercentage === 100
                    ? 'after:bg-[#0DB365]'
                    : 'after:bg-background'
                )}
              />
              <span className="text-background text-caption">
                {progressBarPercentage === 100
                  ? 'FUNDED'
                  : `${progressBarPercentage}%`}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
