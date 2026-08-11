import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";

import type { PortfolioAsset } from "~/routes/portfolio._index/components/AllAssetsStats/types";
import styles from "./styles.module.css";

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

function formatCurrency(value: number, digits = 2) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
    style: "currency",
  }).format(value);
}

function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 1,
    notation: "compact",
    style: "currency",
  }).format(value);
}

export function AllAssetsChart({ assets, totalValue }: AllAssetsChartProps) {
  const chartAssets = assets.slice(0, 10);
  const chartTotal =
    chartAssets.reduce((sum, asset) => sum + asset.value, 0) || 1;
  const conicGradient = chartAssets
    .reduce<string[]>((stops, asset, index) => {
      const previousStop = stops.length
        ? Number.parseFloat(stops[stops.length - 1].split(" ").at(-1) ?? "0")
        : 0;
      const nextStop = previousStop + (asset.value / chartTotal) * 100;
      const color = chartColors[index % chartColors.length];

      stops.push(`${color} ${previousStop}% ${nextStop}%`);
      return stops;
    }, [])
    .join(", ");

  return (
    <aside className={styles.chartPanel} aria-label="Portfolio allocation">
      <div
        className={styles.donut}
        style={{ background: `conic-gradient(${conicGradient})` }}
      >
        <div className={styles.donutCenter}>
          <RHeading size="h6" weight="medium">
            {formatCompactCurrency(totalValue)}
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
                backgroundColor: chartColors[index % chartColors.length],
              }}
            />
            <RText
              className={styles.legendPercentage}
              size="body-sm"
              weight="medium"
            >
              {((asset.value / chartTotal) * 100).toFixed(1)}%
            </RText>
            <span>
              <RText className={styles.blockText} size="body-s">
                {asset.symbol}
              </RText>
              <RText color="neutral-700" size="body-s">
                {formatCurrency(asset.value)}
              </RText>
            </span>
          </div>
        ))}
      </div>
    </aside>
  );
}
