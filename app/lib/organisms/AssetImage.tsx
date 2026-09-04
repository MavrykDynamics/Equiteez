import React, { FC, useMemo } from "react";

import { buildTokenImagesStack } from "~/lib/images-uri";
import { ImageStacked, ImageStackedProps } from "~/lib/molecules/ImageStacked";
import { AssetMetadataBase } from "../types/metadata";

export interface AssetImageProps
  extends Pick<
    ImageStackedProps,
    | "loader"
    | "fallback"
    | "className"
    | "style"
    | "onStackLoaded"
    | "onStackFailed"
  > {
  assetSlug?: string;
  metadata?: AssetMetadataBase | null;
  size?: number;
  fullViewCollectible?: boolean;
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
    return buildTokenImagesStack(metadata?.thumbnailUri);
  }, [metadata]);

  const styleMemo: React.CSSProperties = useMemo(
    () => ({
      objectFit: "cover",
      maxWidth: "100%",
      maxHeight: "100%",
      width: "100%",
      height: "100%",
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
