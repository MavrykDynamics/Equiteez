import React from "react";
import { Text } from "~/lib/atoms/Typography/Text";
import { useTokensContext } from "~/providers/TokensProvider/tokens.provider";
import { AssetIcon } from "~/templates/AssetIcon";
import styles from "./styles.module.css";
import classNames from "clsx";

export function AssetView({
  selectedAssetSlug,
  isSmallView,
}: {
  selectedAssetSlug: string;
  isSmallView?: boolean;
}) {
  const { tokensMetadata } = useTokensContext();
  const metadata = tokensMetadata[selectedAssetSlug];
  return (
    <div
      className={classNames(
        styles.assetWrapper,
        isSmallView && styles.assetWrapperSmall
      )}
    >
      <AssetIcon
        key={selectedAssetSlug}
        size={isSmallView ? 16 : 24}
        assetSlug={selectedAssetSlug}
        className={
          isSmallView
            ? "rounded-full overflow-hidden w-[16px] h-[16px]"
            : "rounded-full overflow-hidden w-[24px] h-[24px]"
        }
      />
      <Text size={isSmallView ? "tinyBody" : "smallBody"} weight="semibold">
        {metadata.symbol}
      </Text>
    </div>
  );
}
