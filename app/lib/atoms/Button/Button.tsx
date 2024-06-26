/* eslint-disable react/prop-types */
import clsx from 'clsx';
import React, { FC } from 'react';
import LoadingSvg from 'app/icons/small-spinner.svg?react';

type ButtonSize = 'small' | 'default' | 'large' | 'outline' | 'custom';
type Variant = 'green' | 'white' | 'outline' | 'red' | 'green-secondary';

type ButtonProps = {
  size?: ButtonSize;
  variant?: Variant;
  isLoading?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const btnSizeClassNames = {
  small: 'px-3 py-2',
  default: 'px-6 py-3',
  large: 'p-x-8 py-4',
  outline: 'px-6 py-[10px]',
  custom: '',
};

const variants = {
  green: 'text-content bg-green-main hover:bg-green-secondary',
  'green-secondary': 'text-content bg-green-tertiary hover:bg-green-secondary',
  white: 'text-content bg-background hover:bg-tabs',
  outline:
    'text-content bg-background border-2 border-green-main hover:bg-green-opacity',
  red: 'text-content bg-red-main hover:bg-red-400',
};

export const Button: FC<ButtonProps> = ({
  size = 'default',
  variant = 'green',
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
        'text-buttons ',
        variants[variant],
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
