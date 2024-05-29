import { CSSProperties, FC } from 'react';
import styles from './spinner.module.css';

type SpinnerProps = {
  size?: number;
};

export const Spinner: FC<SpinnerProps> = ({ size = 24 }) => {
  return (
    <div
      style={{ '--loader-size': `${size}px` } as CSSProperties}
      className={styles.loader}
    />
  );
};
