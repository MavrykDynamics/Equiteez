import { FC } from 'react';
import WarningCycle from 'app/icons/warning-circle.svg?react';
import clsx from 'clsx';

const variants = {
  warning: {
    className: 'bg-[#FFE1B580] text-yellow-950',
    Icon: WarningCycle,
  },
};

type WarningBlockProps = {
  variant?: 'warning';
} & PropsWithChildren;

export const WarningBlock: FC<WarningBlockProps> = ({
  variant = 'warning',
  children,
}) => {
  const { className, Icon } = variants[variant];
  return (
    <div
      className={clsx(
        'px-3 py-[10px] flex items-center gap-3 border border-yellow-500 rounded-[10px]',
        className
      )}
    >
      <Icon />
      <p className="text-body-xs font-semibold">{children}</p>
    </div>
  );
};
