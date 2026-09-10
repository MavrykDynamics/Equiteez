import { RText } from "~/lib/atoms/RTypography/RText";
import { getAssetSymbol, type AssetMetadataBase } from "~/lib/metadata";
import { useTokensContext } from "~/providers/TokensProvider/tokens.provider";
import { AssetIcon } from "~/templates/AssetIcon";
import styles from "./styles.module.css";
import classNames from "clsx";

type AssetViewProps = {
  assetIconSrc?: string;
  className?: string;
  isSmallView?: boolean;
  secondaryAssetIconAlt?: string;
  secondaryAssetIconSrc?: string;
  secondaryAssetSlug?: string;
  selectedAssetMetadata?: AssetMetadataBase;
  selectedAssetSlug: string;
};

export function AssetView({
  selectedAssetSlug,
  selectedAssetMetadata,
  assetIconSrc,
  secondaryAssetIconAlt = "",
  secondaryAssetIconSrc,
  secondaryAssetSlug,
  isSmallView,
  className,
}: AssetViewProps) {
  const { tokensMetadata } = useTokensContext();
  const metadata = selectedAssetMetadata ?? tokensMetadata[selectedAssetSlug];
  const hasSecondaryAssetIcon = Boolean(
    secondaryAssetIconSrc || secondaryAssetSlug
  );

  return (
    <div
      className={classNames(
        styles.assetWrapper,
        isSmallView && styles.assetWrapperSmall,
        className
      )}
    >
      <span
        className={classNames(
          styles.assetIconWrapper,
          isSmallView && styles.assetIconWrapperSmall
        )}
      >
        {assetIconSrc ? (
          <img
            alt=""
            aria-hidden="true"
            className={classNames(
              styles.assetImage,
              isSmallView && styles.assetImageSmall
            )}
            src={assetIconSrc}
          />
        ) : (
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
        )}
        {hasSecondaryAssetIcon && (
          <span className={styles.secondaryAssetIconWrapper}>
            {secondaryAssetIconSrc ? (
              <img
                alt={secondaryAssetIconAlt}
                aria-hidden={secondaryAssetIconAlt ? undefined : true}
                className={styles.secondaryAssetIcon}
                src={secondaryAssetIconSrc}
              />
            ) : secondaryAssetSlug ? (
              <AssetIcon
                assetSlug={secondaryAssetSlug}
                className={styles.secondaryAssetIcon}
                size={14}
              />
            ) : null}
          </span>
        )}
      </span>
      <RText size="body-s">{getAssetSymbol(metadata)}</RText>
    </div>
  );
}
