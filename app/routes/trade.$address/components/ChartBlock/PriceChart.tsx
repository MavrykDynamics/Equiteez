import {
  ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
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

const PRICE_DECIMALS = 2;

function getPrice(point: AssetPriceChartPoint) {
  return point.usd ?? point.p;
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
  const [hoveredPoint, setHoveredPoint] = useState<AssetPriceChartHover | null>(
    null
  );
  const chartCanvasRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipSize, setTooltipSize] = useState({ height: 0, width: 0 });

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
  const tooltipPosition = useMemo(() => {
    if (!hoveredPoint || !chartCanvasRef.current) {
      return null;
    }

    const canvasWidth = chartCanvasRef.current.clientWidth;
    const canvasHeight = chartCanvasRef.current.clientHeight;
    const tooltipWidth = tooltipSize.width;
    const tooltipHeight = tooltipSize.height;
    const verticalOffset = 12;
    const edgePadding = 8;

    let left = hoveredPoint.x - tooltipWidth / 2;

    left = Math.max(
      edgePadding,
      Math.min(left, canvasWidth - tooltipWidth - edgePadding)
    );

    let top = hoveredPoint.y - tooltipHeight - verticalOffset;

    if (top < edgePadding) {
      top = hoveredPoint.y + verticalOffset;
    }

    top = Math.max(
      edgePadding,
      Math.min(top, canvasHeight - tooltipHeight - edgePadding)
    );

    return { left, top };
  }, [hoveredPoint, tooltipSize.height, tooltipSize.width]);

  useLayoutEffect(() => {
    if (!hoveredPoint || !tooltipRef.current) {
      return;
    }

    const nextWidth = tooltipRef.current.offsetWidth;
    const nextHeight = tooltipRef.current.offsetHeight;

    setTooltipSize((currentSize) => {
      if (
        currentSize.width === nextWidth &&
        currentSize.height === nextHeight
      ) {
        return currentSize;
      }

      return {
        width: nextWidth,
        height: nextHeight,
      };
    });
  }, [hoveredPoint]);

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
          <div
            className={styles.chartState}
            role="status"
            aria-label="Loading price chart"
          >
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
            <div className={styles.chartCanvas} ref={chartCanvasRef}>
              <AssetPriceChart
                className={styles.chart}
                onHover={handleChartHover}
                points={points}
                priceDecimals={PRICE_DECIMALS}
                showPriceScale
                showTimeScale
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
                    ref={tooltipRef}
                    style={tooltipPosition ?? undefined}
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
          </>
        )}
      </div>
    </section>
  );
}
