import clsx from 'clsx';
import { FC } from 'react';

export const CardWithShadow: FC<PropsWithChildren & { className?: string }> = ({
  children,
  className,
}) => {
  return (
    <div
      className={clsx('bg-background rounded-2xl shadow-card p-8', className)}
    >
      {children}
    </div>
  );
};
