import { FC, HTMLAttributes, useMemo } from 'react';

import Avatars from '@dicebear/avatars';
import botttsSprites from '@dicebear/avatars-bottts-sprites';
import jdenticonSpirtes from '@dicebear/avatars-jdenticon-sprites';
import classNames from 'clsx';

import initialsSprites from 'app/lib/avatars-initials-sprites';
import { useAppContext } from '~/providers/AppProvider/AppProvider';

export type IdeniconType = 'jdenticon' | 'bottts' | 'initials';

type IdenticonProps = HTMLAttributes<HTMLDivElement> & {
  type?: IdeniconType;
  hash: string;
  size?: number;
};

const MAX_INITIALS_LENGTH = 5;
const DEFAULT_FONT_SIZE = 50;

export const IdentIcon: FC<IdenticonProps> = ({
  type = 'jdenticon',
  hash,
  size = 100,
  className,
  style = {},
  ...rest
}) => {
  const { IS_WEB } = useAppContext();
  const cache = useMemo(() => new Map<string, string>(), []);

  const icons: Record<
    NonNullable<IdenticonProps['type']>,
    Avatars<object> | null
  > = useMemo(
    () => ({
      jdenticon: IS_WEB ? new Avatars(jdenticonSpirtes) : null,
      bottts: IS_WEB ? new Avatars(botttsSprites) : null,
      initials: IS_WEB ? new Avatars(initialsSprites) : null,
    }),
    [IS_WEB]
  );

  const backgroundImage = useMemo(() => {
    const key = `${type}_${hash}_${size}`;
    if (cache.has(key)) {
      return cache.get(key);
    } else {
      const basicOpts = {
        base64: true,
        width: size,
        height: size,
        margin: 4,
      };

      const opts =
        type === 'initials'
          ? {
              ...basicOpts,
              chars: MAX_INITIALS_LENGTH,
              radius: 50,
              fontSize: estimateOptimalFontSize(
                hash.slice(0, MAX_INITIALS_LENGTH).length
              ),
            }
          : basicOpts;

      if (!icons[type]) return;

      const imgSrc = icons[type].create(hash, opts);

      const bi = `url('${imgSrc}')`;
      cache.set(key, bi);
      return bi;
    }
  }, [type, hash, size, cache, icons]);

  return (
    <div
      className={classNames(
        'inline-block',
        type === 'initials' ? 'bg-transparent' : 'bg-gray-100',
        'bg-no-repeat bg-center',
        'overflow-hidden rounded-full',
        className
      )}
      style={{
        backgroundImage,
        width: size,
        height: size,
        maxWidth: size,
        ...style,
      }}
      {...rest}
    />
  );
};

function estimateOptimalFontSize(length: number) {
  const initialsLength = Math.min(length, MAX_INITIALS_LENGTH);
  if (initialsLength > 2) {
    const n = initialsLength;
    const multiplier = Math.sqrt(
      10000 / ((32 * n + 4 * (n - 1)) ** 2 + 36 ** 2)
    );
    return Math.floor(DEFAULT_FONT_SIZE * multiplier);
  }
  return DEFAULT_FONT_SIZE;
}
