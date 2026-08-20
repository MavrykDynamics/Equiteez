import type { WalletPortfolioAssetType } from "~/lib/apis/rwa/wallet/wallet.types";
import Money from "~/lib/atoms/Money";
import { RText } from "~/lib/atoms/RTypography/RText";

import {
  AssetsDonutChart,
  type AssetsDonutChartAsset,
  chartColors,
} from "./AssetsDonutChart";
import styles from "./styles.module.css";

type AssetClassChartViewProps = {
  assets: WalletPortfolioAssetType[];
  portfolioTotal: number;
};

type AssetClassChartAsset = AssetsDonutChartAsset & {
  assetClass: string;
};

export function AssetClassChartView({
  assets,
  portfolioTotal,
}: AssetClassChartViewProps) {
  const chartAssets = Object.values(
    assets.reduce<Record<string, AssetClassChartAsset>>((groups, asset) => {
      if (
        !Number.isFinite(asset.share_pct) ||
        !Number.isFinite(asset.balance) ||
        asset.share_pct <= 0 ||
        asset.balance <= 0
      ) {
        return groups;
      }

      const assetClass = (asset.asset_class?.trim() || "Other").replace(
        "_",
        " "
      );
      const groupKey = assetClass.toLowerCase();
      const currentGroup = groups[groupKey];

      groups[groupKey] = currentGroup
        ? {
            ...currentGroup,
            balance: currentGroup.balance + asset.balance,
            share_pct: currentGroup.share_pct + asset.share_pct,
          }
        : {
            assetClass,
            balance: asset.balance,
            share_pct: asset.share_pct,
            symbol: assetClass,
            token_address: `asset-class-${groupKey}`,
          };

      return groups;
    }, {})
  ).sort(
    (firstAsset, secondAsset) => secondAsset.share_pct - firstAsset.share_pct
  );

  return (
    <>
      <AssetsDonutChart
        chartAssets={chartAssets}
        portfolioTotal={portfolioTotal}
      />
      <div className={styles.legend}>
        {chartAssets.map((asset, index) => (
          <div className={styles.legendItem} key={asset.token_address}>
            <span
              aria-hidden="true"
              className={styles.legendColor}
              style={{ backgroundColor: chartColors[index] }}
            />
            <RText
              className={styles.legendPercentage}
              size="body-sm"
              weight="medium"
            >
              <Money fiat tooltip={false}>
                {asset.share_pct}
              </Money>
              %
            </RText>
            <RText className={styles.blockText} size="body-s">
              {asset.assetClass}
            </RText>
          </div>
        ))}
      </div>
    </>
  );
}
