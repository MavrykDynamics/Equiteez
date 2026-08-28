import React, { FC, useMemo } from 'react';

import { buildTokenImagesStack } from '~/lib/images-uri';
import { ImageStacked, ImageStackedProps } from '~/lib/molecules/ImageStacked';
import { ASSET_IMAGE_URLS_BY_ADDRESS } from '~/mocks/asset-image-urls.mock';
import { AssetMetadataBase } from '../types/metadata';

export interface AssetImageProps
  extends Pick<
    ImageStackedProps,
    | 'loader'
    | 'fallback'
    | 'className'
    | 'style'
    | 'onStackLoaded'
    | 'onStackFailed'
  > {
  assetSlug?: string;
  metadata?: AssetMetadataBase | null;
  size?: number;
  fullViewCollectible?: boolean;
}

// Temporary mock-image fallback for RWA assets.
// Remove this block once real token media is available and stable in production.
function getTemporaryMockAssetImage(assetSlug?: string) {
  if (!assetSlug) return undefined;

  const [address] = assetSlug.split('_');

  return ASSET_IMAGE_URLS_BY_ADDRESS[address];
}

export const AssetImage: FC<AssetImageProps> = ({
  metadata,
  className,
  size,
  style,
  loader,
  fallback,
  onStackLoaded,
  onStackFailed,
  assetSlug,
}) => {
  const sources = useMemo(() => {
    const temporaryMockImage = getTemporaryMockAssetImage(assetSlug);

    if (temporaryMockImage) {
      return [temporaryMockImage];
    }

    return buildTokenImagesStack(metadata?.thumbnailUri);
  }, [assetSlug, metadata]);

  const styleMemo: React.CSSProperties = useMemo(
    () => ({
      objectFit: 'cover',
      maxWidth: '100%',
      maxHeight: '100%',
      width: '100%',
      height: '100%',
      borderRadius: "50%",
      overflow: "hidden",
      ...style,
    }),
    [style]
  );

  return (
    <ImageStacked
      sources={sources}
      loader={loader}
      fallback={fallback}
      alt={metadata?.name}
      className={className}
      style={styleMemo}
      height={size}
      width={size}
      onStackLoaded={onStackLoaded}
      onStackFailed={onStackFailed}
    />
  );
};
