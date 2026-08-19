import { useState } from "react";

import { RText } from "~/lib/atoms/RTypography/RText";

import type { WalletPortfolioAssetType } from "~/lib/apis/rwa/wallet/wallet.types";
import Money from "~/lib/atoms/Money";
import { AssetsDonutChart, type AssetsDonutChartAsset, chartColors } from "./AssetsDonutChart";
import styles from "./styles.module.css";

type AllAssetsChartProps = {
  assets: WalletPortfolioAssetType[];
  portfolioTotal: number;
};

type ChartAsset = Pick<
  WalletPortfolioAssetType,
  "token_address" | "symbol" | "share_pct" | "balance"
> & {
  members?: WalletPortfolioAssetType[];
};

type AssetsChartView = "wallet" | "asset-class";

export function AssetsChart({ assets, portfolioTotal }: AllAssetsChartProps) {
  const [chartView, setChartView] = useState<AssetsChartView>("wallet");
  const [isOtherDetailsVisible, setIsOtherDetailsVisible] = useState(false);
  const orderedAssets = [...assets]
    .filter(
      (asset) => Number.isFinite(asset.share_pct) && Number.isFinite(asset.balance)
    )
    .filter((asset) => asset.share_pct > 0 && asset.balance > 0)
    .sort((firstAsset, secondAsset) => secondAsset.share_pct - firstAsset.share_pct);
  const otherMembers =
    orderedAssets.length > 9
      ? orderedAssets.slice(9)
      : orderedAssets.filter((asset) => asset.share_pct < 1);
  const otherMemberIds = new Set(
    otherMembers.map((asset) => asset.token_address)
  );
  const primaryAssets = orderedAssets.filter(
    (asset) => !otherMemberIds.has(asset.token_address)
  );
  const otherSharePct = otherMembers.reduce(
    (sum, asset) => sum + asset.share_pct,
    0
  );
  const otherBalance = otherMembers.reduce(
    (sum, asset) => sum + asset.balance,
    0
  );
  const chartAssets: ChartAsset[] = [
    ...primaryAssets.map((item) => ({
      ...item,
      symbol: item.symbol.toUpperCase(),
    })),
    ...(otherSharePct > 0
      ? [
          {
            balance: otherBalance,
            share_pct: otherSharePct,
            token_address: "portfolio-other",
            members: otherMembers,
            symbol: "Other",
          },
        ]
      : []),
  ];
  const donutChartAssets: AssetsDonutChartAsset[] = chartAssets.map((asset) => ({
    balance: asset.balance,
    share_pct: asset.share_pct,
    symbol: asset.symbol,
    token_address: asset.token_address,
  }));

  return (
    <aside className={styles.chartPanel} aria-label="Portfolio allocation">
      <div className={styles.chartSwitcher}>
        <RText size="body-s">By Wallet</RText>
        <button
          aria-checked={chartView === "asset-class"}
          aria-label="Group portfolio allocation by asset class"
          className={styles.chartViewToggle}
          onClick={() =>
            setChartView((view) =>
              view === "wallet" ? "asset-class" : "wallet"
            )
          }
          role="switch"
          type="button"
        >
          <span aria-hidden="true" className={styles.chartViewToggleThumb} />
        </button>
        <RText size="body-s">By Asset Class</RText>
      </div>
      <AssetsDonutChart
        chartAssets={donutChartAssets}
        portfolioTotal={portfolioTotal}
      />
      <div className={styles.legend}>
        {chartAssets.map((asset, index) => (
          <div
            className={
              asset.members
                ? `${styles.legendItem} ${styles.otherLegendItem}`
                : styles.legendItem
            }
            key={asset.token_address}
            onMouseEnter={() => asset.members && setIsOtherDetailsVisible(true)}
            onMouseLeave={() => setIsOtherDetailsVisible(false)}
          >
            <span
              aria-hidden="true"
              className={styles.legendColor}
              style={{
                backgroundColor: chartColors[index],
              }}
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
            <span>
              <RText className={styles.blockText} size="body-s">
                {asset.symbol}
              </RText>
              {/*<RText color="neutral-700" size="body-s">*/}
              {/*  $*/}
              {/*  <Money fiat tooltip={false}>*/}
              {/*    {asset.balance}*/}
              {/*  </Money>*/}
              {/*</RText>*/}
            </span>
            {asset.members && isOtherDetailsVisible ? (
              <div className={styles.otherTooltip} role="tooltip">
                <div className={styles.otherTooltipList}>
                  {asset.members.map((member) => (
                    <div
                      className={styles.otherTooltipRow}
                      key={member.token_address}
                    >
                      <RText size="body-s" weight="medium">
                        <Money fiat tooltip={false}>
                          {member.share_pct}
                        </Money>
                        %
                      </RText>
                      <div className={styles.otherTooltipRowContent}>
                        <RText className={styles.blockText} size="body-xs">
                          {member.symbol.toUpperCase()}
                        </RText>
                        <RText color="neutral-700" size="body-xs">
                          $
                          <Money fiat tooltip={false}>
                            {member.balance}
                          </Money>
                        </RText>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </aside>
  );
}
