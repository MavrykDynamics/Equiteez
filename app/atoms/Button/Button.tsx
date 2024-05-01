import clsx from 'clsx';
import React, { FC } from 'react';
import LoadingSvg from 'app/icons/small-spinner.svg?react';

type ButtonSize = 'small' | 'default' | 'large';

type ButtonProps = {
  size?: ButtonSize;
  isLoading?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const btnSizeClassNames = {
  small: 'px-3 py-2',
  default: 'px-6 py-3',
  large: 'p-x-8 py-4',
};

export const Button: FC<ButtonProps> = ({
  size = 'default',
  children,
  className,
  disabled,
  isLoading,
  ...rest
}) => {
  return (
    <button
      className={clsx(
        'transition ease-in-out duration-200',
        'flex justify-center items-center rounded-lg',
        'text-buttons text-content bg-green-main',
        'hover:bg-green-secondary',
        btnSizeClassNames[size],
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
      {...rest}
    >
      {isLoading ? (
        <div className="animate-spin w-6 h-6">
          <LoadingSvg className="w-6 h-6" />
        </div>
      ) : (
        children
      )}
    </button>
  );
};
