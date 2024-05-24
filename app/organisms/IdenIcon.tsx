import { FC, HTMLAttributes, useMemo } from 'react';

import { createAvatar } from '@dicebear/core';
import { lorelei } from '@dicebear/collection';
import { clsx } from 'clsx';

type IdenticonProps = HTMLAttributes<HTMLDivElement> & {
  hash: string;
  size?: number;
};

export const IdentIcon: FC<IdenticonProps> = ({ size = 100, className }) => {
  const avatar = useMemo(() => {
    return createAvatar(lorelei, {
      size,
      // ... other options
    }).toDataUriSync();
  }, [size]);

  return (
    <div
      className={clsx('overflow-hidden rounded-full bg-gray-100', className)}
    >
      <img
        className={clsx('bg-no-repeat bg-center w-full h-full')}
        src={avatar}
        alt="test"
      />
    </div>
  );
};
