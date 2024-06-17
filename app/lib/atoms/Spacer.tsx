import clsx from 'clsx';
import { FC } from 'react';

type SpacerProps = {
  className?: string;
  height?: number;
};

export const Spacer: FC<SpacerProps> = ({ height = 100, className }) => {
  return (
    <div style={{ height }} className={clsx(`bg-transparent`, className)} />
  );
};
