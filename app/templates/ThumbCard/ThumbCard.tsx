import { FC, useMemo } from 'react';

import styles from './thumbCard.module.css';
import clsx from 'clsx';

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

          <div className="flex flex-col items-start">
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
