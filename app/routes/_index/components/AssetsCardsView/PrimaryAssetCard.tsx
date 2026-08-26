import { generatePath, Link } from "@remix-run/react";

import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import Money from "~/lib/atoms/Money";
import { RIcon } from "~/lib/atoms/RIcon";
import { RText } from "~/lib/atoms/RTypography/RText";
import { AssetSaleProgress } from "./AssetSaleProgress";
import styles from "./styles.module.css";
import { AssetBadge } from "~/routes/_index/components/AssetBadge/AssetBadge";
import { AssetIdentity } from "~/routes/_index/components/AssetsCardsView/AssetIdentity";
import { ROUTES } from "~/consts";
import { useAssetPrice } from "~/providers/AssetsProvider/hooks/useAssetPrice";

type PrimaryAssetCardProps = {
  asset: AssetType;
};

export function PrimaryAssetCard({ asset }: PrimaryAssetCardProps) {
  const { price } = useAssetPrice(asset);

  return (
    <Link
      className={styles.primaryAssetCard}
      to={generatePath(ROUTES.trade, { address: asset.address })}
    >
      <div className={styles.cardHeader}>
        <AssetBadge asset={asset} />

        <RIcon
          aria-hidden="true"
          className={styles.arrowIcon}
          name="arrow-long-up-right"
        />
      </div>

      <AssetIdentity asset={asset} />

      <div className={styles.priceSection}>
        <RText className={styles.price} weight="medium">
          $
          <Money fiat tooltip={false}>
            {price}
          </Money>
        </RText>
        <div className={styles.priceDescription}>
          <RText color="neutral-600" size="body-s">
            Listing Price
          </RText>
          <span aria-hidden="true" className={styles.separator} />
          <RText color="neutral-600" size="body-s">
            Fixed
          </RText>
        </div>
      </div>

      <div className={styles.saleProgressSection}>
        <AssetSaleProgress asset={asset} />
      </div>

      {/*TODO remove mock data*/}
      <div className={styles.projectedYield}>
        <RText color="neutral-600" size="body-s">
          Projected Yield
        </RText>
        <RText size="body-s" weight="medium">
          <Money tooltip={false}>4.78</Money>%
        </RText>
      </div>
    </Link>
  );
}
