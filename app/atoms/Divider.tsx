import clsx from 'clsx';
import { FC } from 'react';

type DividerProps = {
  className?: string;
};

export const Divider: FC<DividerProps> = ({ className }) => {
  return <div className={clsx('h-[1px] bg-divider', className)} />;
};
