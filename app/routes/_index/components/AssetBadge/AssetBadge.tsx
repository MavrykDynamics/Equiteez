import styles from "./styles.module.css";
import { RText } from "~/lib/atoms/RTypography/RText";
import { useAssetsContext } from "~/providers/AssetsProvider/assets.provider";
import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";

export function AssetBadge({ asset }: { asset: AssetType }) {
  const { assetTypes } = useAssetsContext();
  const assetType = assetTypes[asset.profile.asset_type];

  return (
    <span className={styles.assetTypeBadge}>
      <RText color="accent-green-500" size="body-s">
        {assetType?.label ?? asset.profile.asset_type}
      </RText>
    </span>
  );
}
