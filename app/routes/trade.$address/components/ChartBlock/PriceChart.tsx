import { useEffect, useMemo, useState } from "react";

import { fetchPriceSeries } from "~/lib/apis/rwa";
import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import { Spinner } from "~/lib/atoms/Spinner";
import {
  AssetPriceChart,
  type AssetPriceChartPoint,
} from "~/routes/discover/components/AssetPriceChart/AssetPriceChart";

import styles from "./styles.module.css";

type AssetDetailsProps = {
  asset: AssetType;
};

type ChartInterval = "15m" | "1h" | "4h" | "1d";

const CHART_INTERVALS: Array<{ label: string; value: ChartInterval }> = [
  { label: "15M", value: "15m" },
  { label: "1H", value: "1h" },
  { label: "4H", value: "4h" },
  { label: "1D", value: "1d" },
];

const Y_AXIS_TICKS_COUNT = 6;
const X_AXIS_TICKS_COUNT = 6;

function getPrice(point: AssetPriceChartPoint) {
  return point.usd ?? point.p;
}

function getYAxisLabels(points: AssetPriceChartPoint[]) {
  const prices = points.map(getPrice).filter(Number.isFinite);

  if (prices.length === 0) return [];

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const step = (max - min) / (Y_AXIS_TICKS_COUNT - 1);

  return Array.from({ length: Y_AXIS_TICKS_COUNT }, (_, index) =>
    max - step * index
  );
}

function getXAxisLabels(points: AssetPriceChartPoint[]) {
  if (points.length === 0) return [];

  return Array.from({ length: X_AXIS_TICKS_COUNT }, (_, index) => {
    const pointIndex = Math.round(
      (index * (points.length - 1)) / (X_AXIS_TICKS_COUNT - 1)
    );
    const date = new Date(points[pointIndex].t);

    return Number.isNaN(date.getTime())
      ? ""
      : new Intl.DateTimeFormat("en-US", {
          day: "numeric",
          month: index === 0 || date.getDate() <= 2 ? "short" : undefined,
        }).format(date);
  });
}

function formatAxisPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value);
}

export function PriceChart({ asset }: AssetDetailsProps) {
  const [interval, setInterval] = useState<ChartInterval>("1h");
  const [points, setPoints] = useState<AssetPriceChartPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrentRequest = true;

    setIsLoading(true);
    setError(null);
    setPoints([]);

    void fetchPriceSeries({
      interval,
      symbol: asset.metadata.symbol,
    })
      .then((series) => {
        if (isCurrentRequest) setPoints(series.points);
      })
      .catch(() => {
        if (isCurrentRequest) setError("Unable to load price data.");
      })
      .finally(() => {
        if (isCurrentRequest) setIsLoading(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [asset.metadata.symbol, interval]);

  const yAxisLabels = useMemo(() => getYAxisLabels(points), [points]);
  const xAxisLabels = useMemo(() => getXAxisLabels(points), [points]);
  const lastPoint = points.at(-1);
  const firstPoint = points[0];
  const tone =
    !firstPoint || !lastPoint || getPrice(lastPoint) >= getPrice(firstPoint)
      ? "positive"
      : "negative";

  return (
    <section className={styles.priceChart} aria-label="Price chart">
      <div className={styles.chartControls} role="tablist" aria-label="Price interval">
        {CHART_INTERVALS.map(({ label, value }) => (
          <button
            aria-selected={interval === value}
            className={styles.intervalButton}
            key={value}
            onClick={() => setInterval(value)}
            role="tab"
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      <div className={styles.chartFrame}>
        {isLoading ? (
          <div className={styles.chartState} role="status" aria-label="Loading price chart">
            <Spinner size={32} />
          </div>
        ) : error ? (
          <p className={styles.chartState} role="alert">
            {error}
          </p>
        ) : points.length < 2 ? (
          <p className={styles.chartState}>No price data available.</p>
        ) : (
          <>
            <div className={styles.chartWithYAxis}>
              <AssetPriceChart
                className={styles.chartCanvas}
                points={points}
                tone={tone}
              />
              <div className={styles.yAxis} aria-hidden="true">
                {yAxisLabels.map((value, index) => (
                  <span key={`${value}-${index}`}>{formatAxisPrice(value)}</span>
                ))}
              </div>
            </div>
            <div className={styles.xAxis} aria-hidden="true">
              {xAxisLabels.map((label, index) => (
                <span key={`${label}-${index}`}>{label}</span>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
