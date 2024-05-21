import clsx from 'clsx';
import { FC } from 'react';

type SpacerProps = {
  className?: string;
  height?: number;
};

export const Spacer: FC<SpacerProps> = ({ height = 100, className }) => {
  return <div className={clsx(`h-[${height}px] bg-transparent`, className)} />;
};
