import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";

import { PrimaryAssetCard } from "./PrimaryAssetCard";
import { SecondaryAssetCard } from "./SecondaryAssetCard";
import styles from "./styles.module.css";

type AssetsCardsViewProps = {
  assets: AssetType[];
};

export function AssetsCardsView({ assets }: AssetsCardsViewProps) {
  return (
    <div className={styles.cardsView}>
      <div className={styles.cardsGrid}>
        {assets.map((asset) => {
          if (asset.profile.lifecycle === "primary_issuance") {
            return <PrimaryAssetCard asset={asset} key={asset.address} />;
          }

          return <SecondaryAssetCard asset={asset} key={asset.address} />;
        })}
      </div>
    </div>
  );
}
