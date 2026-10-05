import { generatePath, Link } from "@remix-run/react";

import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import { RIcon } from "~/lib/atoms/RIcon";
import styles from "./styles.module.css";
import { AssetBadge } from "~/routes/_index/components/AssetBadge/AssetBadge";
import { ROUTES } from "~/consts";
import { CardBody } from "~/routes/_index/components/ImageAssetsView/ImageAssetCard";
import { AssetApyBadge } from "~/routes/_index/components/AssetBadge/AssetApyBadge";

type PrimaryAssetCardProps = {
  asset: AssetType;
};

export function PrimaryAssetCard({ asset }: PrimaryAssetCardProps) {
  return (
    <Link
      className={styles.primaryAssetCard}
      to={generatePath(ROUTES.trade, { address: asset.address })}
    >
      <div className={styles.cardHeader}>
        <div className={styles.assetBadgeList}>
          <AssetBadge asset={asset} />
          <AssetApyBadge asset={asset} />
        </div>

        <RIcon
          aria-hidden="true"
          className={styles.arrowIcon}
          name="arrow-long-up-right"
        />
      </div>

      <CardBody asset={asset} isCardInView />
    </Link>
  );
}
