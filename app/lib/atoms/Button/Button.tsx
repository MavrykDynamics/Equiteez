/* eslint-disable react/prop-types */
import clsx from 'clsx';
import React, { FC, useMemo } from 'react';
import LoadingSvg from 'app/icons/small-spinner.svg?react';

type ButtonSize =
  | 'small'
  | 'default'
  | 'large'
  | 'outline'
  | 'custom'
  | 'small-plus';

type Variant =
  | 'green'
  | 'white'
  | 'outline'
  | 'red'
  | 'green-secondary'
  | 'dark'
  | 'dark-outline'
  | 'blue'
  | 'custom';

type TextVariant = 'buttons' | 'caption';

type ButtonProps = {
  size?: ButtonSize;
  variant?: Variant;
  isLoading?: boolean;
  textVariant?: TextVariant;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const btnSizeClassNames = {
  small: 'px-3 py-2',
  'small-plus': 'px-6 py-[10px]',
  default: 'px-8 py-3',
  large: 'px-8 py-4',
  outline: 'px-8 py-[10px]',
  custom: '',
};

const variants = {
  green:
    'text-white bg-green-main hover:bg-dark-green-400 focus:bg-dark-green-600',
  'green-secondary': 'text-content bg-green-tertiary hover:bg-green-secondary',
  white: 'text-content bg-background hover:bg-tabs',
  outline:
    // Added py-8px to avoid border extra height !
    'text-dark-green-500 bg-transparent border-2 border-green-main hover:bg-dark-green-opacity focus:bg-dark-green-focus',
  red: 'text-content bg-red-main hover:bg-red-400',
  dark: 'bg-black-secondary text-white hover:bg-gray-800',
  'dark-outline':
    'border-2 border-black-secondary text-black-secondary py-[8px]',
  blue: 'bg-blue-300 hover:bg-blue-200 text-content',
  custom: '',
};

const textVariants = {
  buttons: 'text-buttons font-bold',
  caption: 'text-caption',
};

const svgColors = {
  outline: 'text-dark-green-500 stroke-current',
};

export const Button: FC<ButtonProps> = ({
  size = 'default',
  variant = 'green',
  textVariant = 'buttons',
  children,
  className,
  disabled,
  isLoading,
  onClick,
  onSubmit,
  ...rest
}) => {
  return (
    <button
      className={clsx(
        'transition ease-in-out duration-200',
        'flex justify-center items-center rounded-4xl',
        textVariants[textVariant],
        variants[variant],
        btnSizeClassNames[size],
        disabled && 'opacity-50 pointer-events-none',
        isLoading &&
          clsx(
            'cursor-not-allowed',
            size === 'small' || size === 'small-plus'
              ? 'min-w-[129px]'
              : 'min-w-[144px]'
          ),
        className
      )}
      onClick={isLoading ? undefined : onClick}
      onSubmit={isLoading ? undefined : onSubmit}
      {...rest}
    >
      {isLoading ? (
        <div className="animate-spin w-6 h-6">
          <LoadingSvg
            className={clsx(
              'w-6 h-6',
              variant === 'outline'
                ? svgColors[variant]
                : 'text-white stroke-current'
            )}
          />
        </div>
      ) : (
        children
      )}
    </button>
  );
};

type ButtonWithIconProps = {
  icon: JSX.Element;
  position: 'left' | 'right';
} & ButtonProps;

export const ButtonWithIcon: FC<ButtonWithIconProps> = ({
  icon,
  position,
  children,
  className,
  ...rest
}) => {
  const memoizedClassName = useMemo(
    () => (position === 'left' ? 'pl-6' : 'pr-6'),
    [position]
  );

  return (
    <Button
      className={clsx('flex items-center gap-2', memoizedClassName, className)}
      {...rest}
    >
      {position === 'left' && icon}
      {children}
      {position === 'right' && icon}
    </Button>
  );
};
