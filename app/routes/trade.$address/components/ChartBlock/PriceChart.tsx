import {
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { fetchPriceChange, fetchPriceSeries } from "~/lib/apis/rwa";
import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import type { AssetPriceChangeType } from "~/lib/apis/rwa/prices/prices.types";
import { RIcon } from "~/lib/atoms/RIcon";
import { Spinner } from "~/lib/atoms/Spinner";
import { useAssetPrice } from "~/providers/AssetsProvider/hooks/useAssetPrice";
import {
  AssetPriceChart,
  type AssetPriceChartHover,
  type AssetPriceChartPoint,
} from "~/routes/_index/components/AssetPriceChart/AssetPriceChart";

import styles from "./styles.module.css";
import Money from "~/lib/atoms/Money";
import { RPriceChange } from "~/lib/molecules/RPriceChange";

type AssetDetailsProps = {
  asset: AssetType;
  orderBookControl?: ReactNode;
  onToneChange?: (tone: "positive" | "negative") => void;
};

type ChartRange = "1h" | "1d" | "1w" | "1m";
type Tone = "positive" | "negative";
type PriceChangeView = {
  amount: number | null;
  percentage: number | null;
  tone: Tone;
};

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

function getPeriodByRange(range: ChartRange): "1h" | "24h" | "7d" | "30d" {
  switch (range) {
    case "1h":
      return "1h";
    case "1d":
      return "24h";
    case "1w":
      return "7d";
    case "1m":
      return "30d";
  }
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

function getFallbackPriceChange(
  points: AssetPriceChartPoint[]
): PriceChangeView {
  const firstPoint = points[0];
  const lastPoint = points.at(-1);

  if (!firstPoint || !lastPoint) {
    return {
      amount: null,
      percentage: null,
      tone: "positive",
    };
  }

  const amount = getPrice(lastPoint) - getPrice(firstPoint);
  const percentage =
    getPrice(firstPoint) !== 0 ? (amount / getPrice(firstPoint)) * 100 : null;

  return {
    amount,
    percentage,
    tone: amount < 0 ? "negative" : "positive",
  };
}

function getServerPriceChange(
  priceChangeData: AssetPriceChangeType,
  range: ChartRange
): PriceChangeView | null {
  const periodData = priceChangeData.periods[getPeriodByRange(range)];

  if (!periodData) {
    return null;
  }

  if (periodData.delta_abs === null || periodData.change_pct === null) {
    return {
      amount: null,
      percentage: null,
      tone: "positive",
    };
  }

  return {
    amount: periodData.delta_abs,
    percentage: periodData.change_pct,
    tone: periodData.delta_abs < 0 ? "negative" : "positive",
  };
}

function formatPriceChange(view: PriceChangeView) {
  if (view.amount === null || view.percentage === null) {
    return {
      className: styles.neutralPriceChange,
      iconName: null,
      text: "--",
    };
  }

  return {
    className:
      view.tone === "positive"
        ? styles.positivePriceChange
        : styles.negativePriceChange,
    iconName: view.tone === "positive" ? "trending-up" : "trending-down",
    text: null,
  };
}

export function PriceChart({
  asset,
  onToneChange,
  orderBookControl,
}: AssetDetailsProps) {
  const { price } = useAssetPrice(asset);
  const [range, setRange] = useState<ChartRange>("1d");
  const [points, setPoints] = useState<AssetPriceChartPoint[]>([]);
  const [priceChangeView, setPriceChangeView] = useState<PriceChangeView>({
    amount: 0,
    percentage: 0,
    tone: "positive",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<AssetPriceChartHover | null>(
    null
  );
  const chartCanvasRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipSize, setTooltipSize] = useState({ height: 0, width: 0 });

  useEffect(() => {
    setPoints([]);
    setPriceChangeView({
      amount: null,
      percentage: null,
      tone: "positive",
    });
  }, [asset.address]);

  useEffect(() => {
    let isCurrentRequest = true;

    setIsLoading(true);
    setError(null);
    setHoveredPoint(null);

    const chartRequestParams = getChartRequestParams(range);
    const changePeriod = getPeriodByRange(range);

    void Promise.all([
      fetchPriceSeries({
        ...chartRequestParams,
        symbol: asset.metadata.symbol,
      }),
      fetchPriceChange({
        currencies: ["usd"],
        periods: [changePeriod],
        symbol: asset.metadata.symbol,
      }),
    ])
      .then(([series, priceChange]) => {
        if (!isCurrentRequest) {
          return;
        }

        const nextPriceChangeView =
          getServerPriceChange(priceChange, range) ??
          getFallbackPriceChange(series.points);

        setPoints(series.points);
        setPriceChangeView(nextPriceChangeView);
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

  const tone = priceChangeView.tone;
  const priceChangeDisplay = formatPriceChange(priceChangeView);
  const priceChangePrefix =
    priceChangeView.amount !== null && priceChangeView.amount < 0 ? "-" : "+";

  useEffect(() => {
    onToneChange?.(tone);
  }, [onToneChange, tone]);

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
        <div className={styles.priceSummary}>
          <span className={styles.currentPrice}>
            $
            <Money fiat tooltip={false}>
              {price}
            </Money>
          </span>
          <RPriceChange
            amount={priceChangeView.amount}
            percentage={priceChangeView.percentage}
            showPeriodLabel={false}
            size="body-sm"
          />
        </div>
        <div className={styles.chartHeaderActions}>
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
      </div>

      <div className={styles.chartFrame}>
        {isLoading && !points.length ? (
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
              {isLoading ? (
                <div
                  className={styles.loadingOverlay}
                  role="status"
                  aria-live="polite"
                >
                  <Spinner size={32} />
                </div>
              ) : null}
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
      <div className={styles.depthChartAction}>
        <button
          aria-selected
          className={styles.toggleButton}
          role="tab"
          type="button"
        >
          <RIcon name="arrow-long-down" />
          <span className={styles.toggleLabel}>View Depth Chart</span>
        </button>
      </div>
    </section>
  );
}
