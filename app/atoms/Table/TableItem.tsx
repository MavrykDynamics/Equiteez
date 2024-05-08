import clsx from 'clsx';
import { FC } from 'react';

type TextVariant = 'body' | 'bold';

type TableItemProps = {
  isLast?: boolean;
  textVariant?: TextVariant;
} & PropsWithChildren;

const textVariants = {
  body: 'text-body',
  bold: 'text-buttons',
};

export const TableItem: FC<TableItemProps> = ({
  children,
  isLast,
  textVariant = 'body',
}) => {
  return (
    <div
      className={clsx(
        'flex items-center justify-between w-full text-content',
        textVariants[textVariant],
        !isLast ? 'border-b border-divider py-4' : 'pt-4'
      )}
    >
      {children}
    </div>
  );
};
