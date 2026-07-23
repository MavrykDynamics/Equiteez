import styles from "~/routes/discover/components/AssetsCardsView/styles.module.css";
import { RText } from "~/lib/atoms/RTypography/RText";
import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";

export function AssetIdentity({ asset }: { asset: AssetType }) {
  return (
    <div className={styles.assetIdentity}>
      <RText size="body-m" weight="medium">
        {asset.metadata.symbol || "--"}
      </RText>
      <RText className={styles.assetName} color="neutral-600" size="body-s">
        {asset.metadata.name || "--"}
      </RText>
    </div>
  );
}
