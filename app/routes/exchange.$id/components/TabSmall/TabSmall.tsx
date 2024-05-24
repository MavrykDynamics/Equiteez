import clsx from 'clsx';
import { FC } from 'react';

export const TabSmall: FC<PropsWithChildren & { className?: string }> = ({
  children,
  className,
}) => {
  return (
    <button
      className={clsx('px-3 py-2 text-content text-caption cursor-pointer rounded-lg outline-none flex justify-center items-center bg-inactive-tab', className)} 
    >
      {children}
    </button>
  );
};
