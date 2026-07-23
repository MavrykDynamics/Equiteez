import { Link } from "@remix-run/react";

import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import Money from "~/lib/atoms/Money";
import { RIcon } from "~/lib/atoms/RIcon";
import { RText } from "~/lib/atoms/RTypography/RText";
import styles from "./styles.module.css";
import { AssetPriceChart, type AssetPriceChartPoint } from "../AssetPriceChart/AssetPriceChart";
import { AssetBadge } from "~/routes/discover/components/AssetBadge/AssetBadge";
import { AssetIdentity } from "~/routes/discover/components/AssetsCardsView/AssetIdentity";

type AssetPriceChange = {
  amount: number;
  percentage: number;
};

type SecondaryAssetCardProps = {
  asset: AssetType;
  priceChange?: AssetPriceChange;
  points?: AssetPriceChartPoint[];
  trend?: "positive" | "negative";
};

export function SecondaryAssetCard({
  asset,
  priceChange,
  points = [],
  trend,
}: SecondaryAssetCardProps) {
  const isNegative =
    trend === "negative" || (!trend && (priceChange?.percentage ?? 0) < 0);

  return (
    <Link className={styles.secondaryAssetCard} to="/">
      <div className={styles.cardHeader}>
        <AssetBadge asset={asset} />
        <RIcon aria-hidden="true" className={styles.arrowIcon} name="arrow-long-up-right" />
      </div>

      <AssetIdentity asset={asset} />

      <div className={styles.priceSection}>
        <RText className={styles.price} weight="medium">
          $
          <Money fiat tooltip={false}>
            {asset.stats?.price.usd ?? asset.finance.value_per_token}
          </Money>
        </RText>
        <div className={styles.priceChange}>
          {priceChange ? (
            <>
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
                <Money tooltip={false}>{priceChange.amount}</Money>
                {" ("}
                <Money tooltip={false}>{priceChange.percentage}</Money>%)
              </RText>
            </>
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

      <div className={styles.projectedYield}>
        <RText color="neutral-600" size="body-s">
          Net yield
        </RText>
        <RText size="body-s" weight="medium">
          <Money tooltip={false}>{asset.apy}</Money>%
        </RText>
      </div>
    </Link>
  );
}
