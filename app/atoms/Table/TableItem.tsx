import clsx from 'clsx';
import { FC } from 'react';

type TableItemProps = {
  isLast?: boolean;
} & PropsWithChildren;

export const TableItem: FC<TableItemProps> = ({ children, isLast }) => {
  return (
    <div
      className={clsx(
        'flex items-center justify-between w-full',
        !isLast ? 'border-b border-divider py-4' : 'pt-4'
      )}
    >
      {children}
    </div>
  );
};
