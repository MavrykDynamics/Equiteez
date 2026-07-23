import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";

import { PrimaryAssetCard } from "./PrimaryAssetCard";
import { SecondaryAssetCard } from "./SecondaryAssetCard";
import { MOCK_ASSET_PRICE_CHART_POINTS } from "./assetsCardsView.const";
import styles from "./styles.module.css";

type AssetsCardsViewProps = {
  assets: AssetType[];
};

export function AssetsCardsView({ assets }: AssetsCardsViewProps) {
  return (
    <div className={styles.cardsView}>
      <div className={styles.cardsGrid}>
        {assets.map((asset) =>
          asset.profile.lifecycle === "primary_issuance" ? (
            <PrimaryAssetCard asset={asset} key={asset.address} />
          ) : (
            <SecondaryAssetCard
              asset={asset}
              key={asset.address}
              points={MOCK_ASSET_PRICE_CHART_POINTS}
            />
          )
        )}
      </div>
    </div>
  );
}
