import { generatePath, Link } from "@remix-run/react";

import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import Money from "~/lib/atoms/Money";
import { RIcon } from "~/lib/atoms/RIcon";
import { RText } from "~/lib/atoms/RTypography/RText";
import styles from "./styles.module.css";
import { AssetPriceChart } from "../AssetPriceChart/AssetPriceChart";
import { AssetBadge } from "~/routes/_index/components/AssetBadge/AssetBadge";
import { AssetIdentity } from "~/routes/_index/components/AssetsCardsView/AssetIdentity";
import { ROUTES } from "~/consts";
import { useAssetPrice } from "~/providers/AssetsProvider/hooks/useAssetPrice";

export function SecondaryAssetCard({ asset }: { asset: AssetType }) {
  const { price, priceChange, isNegative, points } = useAssetPrice(asset);
  return (
    <Link
      className={styles.secondaryAssetCard}
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
        <div className={styles.priceChange}>
          {priceChange.amount && priceChange.percentage ? (
            <span className={styles.priceChangeIcon}>
              <RIcon
                className={
                  isNegative ? styles.negativeChange : styles.positiveChange
                }
                name={isNegative ? "trending-down" : "trending-up"}
                size="small"
              />
              <RText
                className={
                  isNegative ? styles.negativeChange : styles.positiveChange
                }
                size="body-s"
              >
                {"$"}
                <Money tooltip={false} fiat>
                  {priceChange.amount}
                </Money>
                {" ("}
                <Money tooltip={false} fiat>
                  {priceChange.percentage}
                </Money>
                %)
              </RText>
            </span>
          ) : (
            <RText color="neutral-600" size="body-s">
              --
            </RText>
          )}
          <RText color="neutral-600" size="body-s">
            24h
          </RText>
        </div>
      </div>

      <AssetPriceChart
        className={styles.secondaryChart}
        points={points}
        tone={isNegative ? "negative" : "positive"}
      />

      {/*TODO remove mock data*/}
      <div className={styles.projectedYield}>
        <RText color="neutral-600" size="body-s">
          Net yield
        </RText>
        <RText size="body-s" weight="medium">
          <Money tooltip={false}>4.78</Money>%
        </RText>
      </div>
    </Link>
  );
}
