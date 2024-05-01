import clsx from 'clsx';
import { FC } from 'react';

type SpacerProps = {
  className?: string;
};

export const Spacer: FC<SpacerProps> = ({ className }) => {
  return <div className={clsx('h-[100px] bg-transparent', className)} />;
};
