import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { fetchPriceSeries } from "~/lib/apis/rwa";
import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import { Spinner } from "~/lib/atoms/Spinner";
import {
  AssetPriceChart,
  type AssetPriceChartHover,
  type AssetPriceChartPoint,
} from "~/routes/discover/components/AssetPriceChart/AssetPriceChart";

import styles from "./styles.module.css";

type AssetDetailsProps = {
  asset: AssetType;
  orderBookControl?: ReactNode;
};

type ChartRange = "1h" | "1d" | "1w" | "1m";

const CHART_RANGES: Array<{ label: string; value: ChartRange }> = [
  { label: "1H", value: "1h" },
  { label: "1D", value: "1d" },
  { label: "1W", value: "1w" },
  { label: "1M", value: "1m" },
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

function formatTooltipDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
  }).format(date);
}

function formatTooltipPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 4,
    minimumFractionDigits: 4,
  }).format(value);
}

function getChartRequestParams(range: ChartRange) {
  const to = new Date();
  const from = new Date(to);

  switch (range) {
    case "1h":
      from.setUTCHours(from.getUTCHours() - 1);
      return { from: from.toISOString(), interval: "1m", to: to.toISOString() };
    case "1d":
      from.setUTCDate(from.getUTCDate() - 1);
      return {
        from: from.toISOString(),
        interval: "15m",
        to: to.toISOString(),
      };
    case "1w":
      from.setUTCDate(from.getUTCDate() - 7);
      return { from: from.toISOString(), interval: "1h", to: to.toISOString() };
    case "1m":
      from.setUTCMonth(from.getUTCMonth() - 1);
      return { from: from.toISOString(), interval: "1h", to: to.toISOString() };
  }
}

export function PriceChart({ asset, orderBookControl }: AssetDetailsProps) {
  const [range, setRange] = useState<ChartRange>("1h");
  const [points, setPoints] = useState<AssetPriceChartPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] =
    useState<AssetPriceChartHover | null>(null);

  useEffect(() => {
    let isCurrentRequest = true;

    setIsLoading(true);
    setError(null);
    setPoints([]);
    setHoveredPoint(null);

    const chartRequestParams = getChartRequestParams(range);

    void fetchPriceSeries({
      ...chartRequestParams,
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
  }, [asset.metadata.symbol, range]);

  const yAxisLabels = useMemo(() => getYAxisLabels(points), [points]);
  const xAxisLabels = useMemo(() => getXAxisLabels(points), [points]);
  const lastPoint = points.at(-1);
  const firstPoint = points[0];
  const tone =
    !firstPoint || !lastPoint || getPrice(lastPoint) >= getPrice(firstPoint)
      ? "positive"
      : "negative";
  const handleChartHover = useCallback(
    (hover: AssetPriceChartHover | null) => setHoveredPoint(hover),
    []
  );

  return (
    <section className={styles.priceChart} aria-label="Price chart">
      <div className={styles.chartHeader}>
        <div
          className={styles.chartControls}
          role="tablist"
          aria-label="Price range"
        >
          {CHART_RANGES.map(({ label, value }) => (
            <button
              aria-selected={range === value}
              className={styles.intervalButton}
              key={value}
              onClick={() => setRange(value)}
              role="tab"
              type="button"
            >
              {label}
            </button>
          ))}
        </div>

        {orderBookControl ? (
          <div className={styles.chartHeaderAction}>{orderBookControl}</div>
        ) : null}
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
              <div className={styles.chartCanvas}>
                <AssetPriceChart
                  className={styles.chart}
                  onHover={handleChartHover}
                  points={points}
                  tone={tone}
                />
                {hoveredPoint ? (
                  <>
                    <span
                      aria-hidden="true"
                      className={styles.chartCrosshair}
                      style={{ left: hoveredPoint.x }}
                    />
                    <span
                      aria-hidden="true"
                      className={`${styles.chartPoint} ${
                        tone === "positive"
                          ? styles.positiveChartPoint
                          : styles.negativeChartPoint
                      }`}
                      style={{
                        left: hoveredPoint.x,
                        top: hoveredPoint.y,
                      }}
                    />
                    <div
                      className={styles.chartTooltip}
                      style={{ left: hoveredPoint.x, top: hoveredPoint.y }}
                      role="status"
                    >
                      <strong
                        className={
                          tone === "positive"
                            ? styles.positiveTooltipValue
                            : styles.negativeTooltipValue
                        }
                      >
                        ${formatTooltipPrice(hoveredPoint.value)}
                      </strong>
                      <span>{formatTooltipDate(hoveredPoint.time)}</span>
                    </div>
                  </>
                ) : null}
              </div>
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
