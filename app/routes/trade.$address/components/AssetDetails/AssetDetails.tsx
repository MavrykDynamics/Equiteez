import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import { RIcon } from "~/lib/atoms/RIcon";
import { useAssetsContext } from "~/providers/AssetsProvider/assets.provider";

import { AssetDropdown } from "./AssetDropdown";
import styles from "./styles.module.css";

type AssetDetailsProps = {
  asset: AssetType;
};

export function AssetDetails({ asset }: AssetDetailsProps) {
  const { assetTypes } = useAssetsContext();
  const assetType =
    assetTypes[asset.profile.asset_type]?.label ?? asset.profile.asset_type;

  return (
    <section aria-label="Asset details" className={styles.details}>
      <div className={styles.assetInfo}>
        <AssetDropdown asset={asset} />
        <div className={styles.badges}>
          <span className={styles.apyBadge}>APY {asset.apy.toFixed(2)}%</span>
          <span className={styles.typeBadge}>{assetType}</span>
        </div>
      </div>
      <div className={styles.actions}>
        <button aria-label="Add to favourites" className={styles.iconButton} type="button">
          <RIcon name="star" size="small" />
        </button>
        <button aria-label="Download asset data" className={styles.iconButton} type="button">
          <RIcon name="download" size="small" />
        </button>
      </div>
    </section>
  );
}
