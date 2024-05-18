import clsx from 'clsx';
import { FC } from 'react';

type TextVariant = 'body' | 'bold';

type TableItemProps = {
  isLast?: boolean;
  textVariant?: TextVariant;
  customBorder?: string;
} & PropsWithChildren;

const textVariants = {
  body: 'text-body',
  bold: 'text-buttons',
};

export const TableItem: FC<TableItemProps> = ({
  children,
  isLast,
  customBorder,
  textVariant = 'body',
}) => {
  return (
    <div
      className={clsx(
        'flex items-center justify-between w-full text-content',
        textVariants[textVariant],
        !isLast
          ? clsx(
              'py-4',
              customBorder ? customBorder : 'border-b border-divider'
            )
          : 'pt-4'
      )}
    >
      {children}
    </div>
  );
};
