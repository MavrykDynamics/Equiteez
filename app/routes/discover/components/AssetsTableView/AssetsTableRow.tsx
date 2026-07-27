import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import { RText } from "~/lib/atoms/RTypography/RText";
import { Link } from "@remix-run/react";

import styles from "./styles.module.css";
import Money from "~/lib/atoms/Money";
import { RIcon } from "~/lib/atoms/RIcon";
import { AssetBadge } from "~/routes/discover/components/AssetBadge/AssetBadge";
import { useAssetsContext } from "~/providers/AssetsProvider/assets.provider";
import { AssetPriceChart } from "~/routes/discover/components/AssetPriceChart/AssetPriceChart";

type AssetsTableRowProps = {
  asset: AssetType;
};

export function AssetsTableRow({ asset }: AssetsTableRowProps) {
  const { prices } = useAssetsContext();

  const assetPrices = prices[asset.address] ?? {};
  const points = assetPrices.series_1d?.points || [];

  const priceChange = {
    amount: assetPrices.change_24h?.delta_abs ?? 0,
    percentage: assetPrices.change_24h?.change_pct ?? 0,
  };
  const isNegative = priceChange?.percentage < 0;

  return (
    <Link className={styles.row} role="row" to="/">
      <div className={styles.cell} role="cell">
        <div className={styles.assetContent}>
          <RText className={styles.assetSymbol} size="body-sm" weight="medium">
            {asset.metadata.symbol || "--"}
          </RText>
          <RText
            className={styles.assetName}
            color="neutral-600"
            size="body-sm"
          >
            {asset.metadata.name || "--"}
          </RText>
        </div>
      </div>
      <div className={styles.cell} role="cell">
        <AssetBadge asset={asset} />
      </div>
      <div className={styles.cell} role="cell">
        <RText size="body-sm">
          $
          <Money>
            {assetPrices.usd ??
              assetPrices.price ??
              asset.stats?.price.usd ??
              asset.finance.value_per_token}
          </Money>
        </RText>
      </div>
      <div className={styles.cell} role="cell">
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
        </div>
      </div>
      <div className={styles.cell} role="cell">
        <RText size="body-sm">
          <Money>{asset.apy}</Money>%
        </RText>
      </div>
      <div className={styles.cell} role="cell">
        <RText size="body-sm">
          $<Money>{asset.stats?.market_cap.usd ?? 0}</Money>
        </RText>
      </div>
      <div
        aria-label="24 hour chart placeholder"
        className={`${styles.cell} ${styles.chartCell}`}
        role="cell"
      >
        {asset.profile.lifecycle === "primary_issuance" ? (
          ""
        ) : (
          <AssetPriceChart
            className={styles.secondaryChart}
            points={points}
            tone={isNegative ? "negative" : "positive"}
          />
        )}
      </div>
      <div className={`${styles.cell} ${styles.actionCell}`} role="cell">
        <RText color="neutral-400" size="body-sm">
          <RIcon name="arrow-long-up-right" />
        </RText>
      </div>
    </Link>
  );
}
