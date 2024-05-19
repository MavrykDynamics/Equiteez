import { ComponentProps, FC, HTMLAttributes } from 'react';

import classNames from 'clsx';

import { CopyButtonProps, CopyButton } from './CopyButton';

import { HashShortView } from './HashShortView';

type HashChipProps = HTMLAttributes<HTMLButtonElement> &
  ComponentProps<typeof HashShortView> &
  Pick<CopyButtonProps, 'small' | 'type' | 'rounded'> & { showIcon?: boolean };

export const HashChip: FC<HashChipProps> = ({
  hash,
  trim = true,
  trimAfter,
  firstCharsCount,
  lastCharsCount,
  className,
  type = 'button',
  ...rest
}) => (
  <CopyButton
    text={hash}
    type={type}
    className={classNames(className)}
    {...rest}
  >
    <HashShortView
      hash={hash}
      trimAfter={trimAfter}
      firstCharsCount={firstCharsCount}
      lastCharsCount={lastCharsCount}
      trim={trim}
    />
  </CopyButton>
);
