import clsx from 'clsx';
import { FC } from 'react';

type TextVariant = 'body' | 'bold' | 'body-xs';

type TableItemProps = {
  isLast?: boolean;
  textVariant?: TextVariant;
  customBorder?: string;
  customPadding?: number;
} & PropsWithChildren;

const textVariants = {
  body: 'text-body',
  'body-xs': 'text-body-xs',
  bold: 'text-buttons',
};

export const TableItem: FC<TableItemProps> = ({
  children,
  isLast,
  customBorder,
  customPadding = 16,
  textVariant = 'body',
}) => {
  return (
    <div
      style={{
        paddingTop: customPadding,
        paddingBottom: isLast ? 0 : customPadding,
      }}
      className={clsx(
        'flex items-center justify-between w-full text-content',
        textVariants[textVariant],
        !isLast && clsx(customBorder ? customBorder : 'border-b border-divider')
      )}
    >
      {children}
    </div>
  );
};
