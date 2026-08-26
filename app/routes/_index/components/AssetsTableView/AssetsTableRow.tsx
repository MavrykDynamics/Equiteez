import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import { RText } from "~/lib/atoms/RTypography/RText";
import { generatePath, Link } from "@remix-run/react";

import styles from "./styles.module.css";
import Money from "~/lib/atoms/Money";
import { RIcon } from "~/lib/atoms/RIcon";
import { AssetBadge } from "~/routes/_index/components/AssetBadge/AssetBadge";
import { useAssetsContext } from "~/providers/AssetsProvider/assets.provider";
import { AssetPriceChart } from "~/routes/_index/components/AssetPriceChart/AssetPriceChart";
import { ROUTES } from "~/consts";
import { AssetSaleProgress } from "~/routes/_index/components/AssetsCardsView/AssetSaleProgress";
import { useAssetPrice } from "~/providers/AssetsProvider/hooks/useAssetPrice";
import { atomsToTokens } from "~/lib/utils/formaters";

type AssetsTableRowProps = {
  asset: AssetType;
};

export function AssetsTableRow({ asset }: AssetsTableRowProps) {
  const { assetPrices, priceChange, isNegative, price, points } = useAssetPrice(asset);
  
  return (
    <Link
      className={styles.row}
      role="row"
      to={generatePath(ROUTES.trade, { address: asset.address })}
    >
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
          $<Money fiat>{price}</Money>
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
        </div>
      </div>
      {/*TODO remove mock data*/}
      <div className={styles.cell} role="cell">
        <RText size="body-sm">
          <Money>4.78</Money>%
        </RText>
      </div>
      <div className={styles.cell} role="cell">
        <RText size="body-sm">
          $
          <Money>
            {(atomsToTokens(
              assetPrices.primary_issuance?.max_amount_cap ?? 0,
              asset.metadata.decimals
            ) ||
              asset.stats?.market_cap.usd) ??
              0}
          </Money>
        </RText>
      </div>
      <div
        aria-label="24 hour chart placeholder"
        className={`${styles.cell} ${styles.chartCell}`}
        role="cell"
      >
        {asset.profile.lifecycle === "primary_issuance" ? (
          <AssetSaleProgress asset={asset} isSecondaryView />
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
