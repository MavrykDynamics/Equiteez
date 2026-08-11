import { useState } from "react";

import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";

import type { PortfolioAsset } from "~/routes/portfolio._index/components/AllAssetsStats/types";
import styles from "./styles.module.css";
import Money from "~/lib/atoms/Money";

type AllAssetsChartProps = {
  assets: PortfolioAsset[];
  totalValue: number;
};

const chartColors = [
  "#08a88a",
  "#0f6d52",
  "#a43247",
  "#cf7900",
  "#ac8500",
  "#286392",
  "#4c9515",
  "#6256fe",
  "#56b2fe",
  "#9f4800",
];

const separatorDegrees = 1;
const minimumSliceDegrees = 4;

type ChartAsset = Pick<PortfolioAsset, "id" | "symbol" | "value"> & {
  members?: PortfolioAsset[];
};

export function AllAssetsChart({ assets, totalValue }: AllAssetsChartProps) {
  const [isOtherDetailsVisible, setIsOtherDetailsVisible] = useState(true);
  const orderedAssets = [...assets]
    .filter((asset) => Number.isFinite(asset.value) && asset.value > 0)
    .sort((firstAsset, secondAsset) => secondAsset.value - firstAsset.value);
  const portfolioTotal = orderedAssets.reduce(
    (sum, asset) => sum + asset.value,
    0
  );
  const otherMembers =
    orderedAssets.length > 9
      ? orderedAssets.slice(9)
      : orderedAssets.filter((asset) => asset.value / portfolioTotal < 0.01);
  const otherMemberIds = new Set(otherMembers.map((asset) => asset.id));
  const primaryAssets = orderedAssets.filter(
    (asset) => !otherMemberIds.has(asset.id)
  );
  const otherValue = otherMembers.reduce((sum, asset) => sum + asset.value, 0);
  const chartAssets: ChartAsset[] = [
    ...primaryAssets.map((item) => ({
      ...item,
      symbol: item.symbol.toUpperCase(),
    })),
    ...(otherValue
      ? [
          {
            id: "portfolio-other",
            members: otherMembers,
            symbol: "Other",
            value: otherValue,
          },
        ]
      : []),
  ];
  const chartTotal =
    chartAssets.reduce((sum, asset) => sum + asset.value, 0) || 1;
  const distributableDegrees = Math.max(
    0,
    360 - chartAssets.length * minimumSliceDegrees
  );
  let currentAngle = 0;
  const conicGradient = chartAssets
    .map((asset, index) => {
      const nextAngle =
        currentAngle +
        minimumSliceDegrees +
        (asset.value / chartTotal) * distributableDegrees;
      const colorEnd = Math.max(currentAngle, nextAngle - separatorDegrees);
      const color = chartColors[index];
      const stop = `${color} ${currentAngle}deg ${colorEnd}deg, var(--r-color-neutral-white) ${colorEnd}deg ${nextAngle}deg`;

      currentAngle = nextAngle;
      return stop;
    })
    .join(", ");

  return (
    <aside className={styles.chartPanel} aria-label="Portfolio allocation">
      <div
        className={styles.donut}
        style={{
          background: conicGradient
            ? `conic-gradient(${conicGradient})`
            : "var(--r-color-neutral-100)",
        }}
      >
        <div className={styles.donutCenter}>
          <RHeading size="h6" weight="medium">
            <Money fiat tooltip={false}>
              {totalValue}
            </Money>
          </RHeading>
        </div>
      </div>
      <div className={styles.legend}>
        {chartAssets.map((asset, index) => (
          <div
            className={
              asset.members
                ? `${styles.legendItem} ${styles.otherLegendItem}`
                : styles.legendItem
            }
            key={asset.id}
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
                {(asset.value / chartTotal) * 100}
              </Money>
              %
            </RText>
            <span>
              <RText className={styles.blockText} size="body-s">
                {asset.symbol}
              </RText>
              <RText color="neutral-700" size="body-s">
                $
                <Money fiat tooltip={false}>
                  {asset.value}
                </Money>
              </RText>
            </span>
            {asset.members && isOtherDetailsVisible ? (
              <div className={styles.otherTooltip} role="tooltip">
                <div className={styles.otherTooltipList}>
                  {asset.members.map((member) => (
                    <div className={styles.otherTooltipRow} key={member.id}>
                      <RText size="body-s" weight="medium">
                        <Money fiat tooltip={false}>
                          {(member.value / chartTotal) * 100}
                        </Money>
                        %
                      </RText>
                      <div>
                        <RText className={styles.blockText} size="body-xs">
                          {member.symbol.toUpperCase()}
                        </RText>
                        <RText color="neutral-700" size="body-xs">
                          $
                          <Money fiat tooltip={false}>
                            {member.value}
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
