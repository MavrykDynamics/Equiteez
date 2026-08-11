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

type ChartAsset = Pick<PortfolioAsset, "id" | "symbol" | "value">;

export function AllAssetsChart({ assets, totalValue }: AllAssetsChartProps) {
  const orderedAssets = [...assets]
    .filter((asset) => Number.isFinite(asset.value) && asset.value > 0)
    .sort((firstAsset, secondAsset) => secondAsset.value - firstAsset.value);
  const primaryAssets = orderedAssets.slice(0, 9);
  const otherValue = orderedAssets
    .slice(9)
    .reduce((sum, asset) => sum + asset.value, 0);
  const chartAssets: ChartAsset[] = otherValue
    ? [
        ...primaryAssets,
        {
          id: "portfolio-other",
          symbol: "Other",
          value: otherValue,
        },
      ]
    : primaryAssets;
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
          <div className={styles.legendItem} key={asset.id}>
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
                {asset.symbol.toUpperCase()}
              </RText>
              <RText color="neutral-700" size="body-s">
                <Money fiat tooltip={false}>
                  {asset.value}
                </Money>
              </RText>
            </span>
          </div>
        ))}
      </div>
    </aside>
  );
}
