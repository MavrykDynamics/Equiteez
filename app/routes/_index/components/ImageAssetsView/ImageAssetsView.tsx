import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";

import { ImageAssetCard } from "./ImageAssetCard";
import styles from "./ImageAssetsView.module.css";

type RImageAssetsViewProps = {
  assets: AssetType[];
};

export function ImageAssetsView({ assets }: RImageAssetsViewProps) {
  return (
    <div className={styles.view}>
      <div className={styles.gridFrame}>
        <div className={styles.grid}>
          {assets.map((asset, index) => (
            <ImageAssetCard
              asset={asset}
              key={asset.address}
              revealDelay={Math.min(0.03 * (index + 1), 0.18)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
