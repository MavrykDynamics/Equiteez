import clsx from 'clsx';
import { FC } from 'react';

type ColoredCardProps = {
  variant?: 'info' | 'warning' | 'error' | 'success';
} & PropsWithChildren;

const BG_VARIANTS = {
  info: 'bg-info-blue-bg',
  warning: 'bg-yellow-opacity',
  error: 'bg-info-blue-bg', // to be added
  success: 'bg-info-blue-bg', // to be added
};

export const ColoredCard: FC<ColoredCardProps> = ({
  children,
  variant = 'info',
}) => {
  return (
    <div
      className={clsx(
        'py-4 px-6 rounded-2xl text-body text-content',
        BG_VARIANTS[variant]
      )}
    >
      {children}
    </div>
  );
};
