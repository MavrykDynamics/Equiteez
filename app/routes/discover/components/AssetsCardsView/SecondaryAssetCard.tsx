import { generatePath, Link } from "@remix-run/react";

import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import Money from "~/lib/atoms/Money";
import { RIcon } from "~/lib/atoms/RIcon";
import { RText } from "~/lib/atoms/RTypography/RText";
import styles from "./styles.module.css";
import { AssetPriceChart } from "../AssetPriceChart/AssetPriceChart";
import { AssetBadge } from "~/routes/discover/components/AssetBadge/AssetBadge";
import { AssetIdentity } from "~/routes/discover/components/AssetsCardsView/AssetIdentity";
import { useAssetsContext } from "~/providers/AssetsProvider/assets.provider";
import { ROUTES } from "~/consts";

export function SecondaryAssetCard({ asset }: { asset: AssetType }) {
  const { prices } = useAssetsContext();

  const assetPrices = prices[asset.address] ?? {};
  const points = assetPrices.series_1d?.points || [];

  const priceChange = {
    amount: assetPrices.change_24h?.delta_abs ?? 0,
    percentage: assetPrices.change_24h?.change_pct ?? 0,
  };
  const isNegative = priceChange?.percentage < 0;

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
            {assetPrices.usd ??
              assetPrices.price ??
              asset.stats?.price.usd ??
              asset.finance.value_per_token}
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
                <Money tooltip={false}>{priceChange.amount}</Money>
                {" ("}
                <Money tooltip={false}>{priceChange.percentage}</Money>%)
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
