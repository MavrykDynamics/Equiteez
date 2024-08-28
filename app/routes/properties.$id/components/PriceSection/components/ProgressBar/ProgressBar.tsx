import clsx from 'clsx';

import styles from './progressbar.module.css';
import { FC } from 'react';

export const ProgresBar: FC<{ tokensCount?: number }> = () => {
  return (
    <div className="flex flex-col">
      <div
        style={{ '--progress-value': '68%' } as React.CSSProperties}
        className={clsx(styles.progressBar, styles.progressPercentage)}
      >
        <span className={styles.dot} />
      </div>
      <div className="flex justify-between text-content text-body mt-1">
        <p>68% USDT</p>
        <p>32% CV</p>
      </div>
    </div>
  );
};
