import React, { FC, HTMLAttributes, useMemo } from 'react';

import classNames, { clsx } from 'clsx';

import CloseIcon from 'app/icons/cross.svg?react';
import useTippy from '../ui/useTippy';

type CleanButtonProps = HTMLAttributes<HTMLButtonElement> & {
  bottomOffset?: string;
  iconClassName?: string;
  iconStyle?: React.CSSProperties;
};

export const CLEAN_BUTTON_ID = 'CLEAN_BUTTON_ID';

const CleanButton: FC<CleanButtonProps> = ({
  bottomOffset = '0.4rem',
  className,
  iconClassName,
  style = {},
  iconStyle = {},
  ...rest
}) => {
  const tippyProps = useMemo(
    () => ({
      trigger: 'mouseenter',
      hideOnClick: false,
      content: 'clean',
      animation: 'shift-away-subtle',
    }),
    []
  );

  const buttonRef = useTippy<HTMLButtonElement>(tippyProps);

  return (
    <button
      id={CLEAN_BUTTON_ID}
      ref={buttonRef}
      type="button"
      className={classNames(
        'absolute',
        'rounded-full',
        'bg-gray-910',
        'p-px',
        'flex items-center',
        'text-xs text-white',
        'transition ease-in-out duration-200',
        className
      )}
      style={{ right: '0.4rem', bottom: bottomOffset, ...style }}
      tabIndex={-1}
      {...rest}
    >
      <CloseIcon
        className={clsx('w-auto h-4 stroke-1', iconClassName)}
        style={iconStyle}
      />
    </button>
  );
};

export default CleanButton;
