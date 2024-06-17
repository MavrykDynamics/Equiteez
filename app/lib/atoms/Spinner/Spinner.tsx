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

export const FullScreenSpinner = () => {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <Spinner size={48} />
    </div>
  );
};
