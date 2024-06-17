import { ComponentProps, FC, HTMLAttributes } from 'react';

import clsx from 'clsx';
import { HashShortView } from '~/lib/atoms/HashShortView';
import { CopyButtonProps, CopyButton } from '~/lib/atoms/CopyButton';

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
  <CopyButton text={hash} type={type} className={clsx(className)} {...rest}>
    <HashShortView
      hash={hash}
      trimAfter={trimAfter}
      firstCharsCount={firstCharsCount}
      lastCharsCount={lastCharsCount}
      trim={trim}
    />
  </CopyButton>
);
