import clsx from 'clsx';
import { FC } from 'react';

export const Table: FC<PropsWithChildren & { className?: string }> = ({
  children,
  className,
}) => {
  return (
    <section
      className={clsx(
        'px-7 py-8 flex flex-col rounded-3xl shadow-card border border-gray-100',
        className
      )}
    >
      {children}
    </section>
  );
};
