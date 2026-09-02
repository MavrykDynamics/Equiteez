import {
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import type { OrderbookDepthLevelType } from "~/lib/apis/rwa/orderbookDepth/orderbookDepth.types";
import { useOrderbookDepth } from "~/lib/apis/rwa/orderbookDepth/useOrderbookDepth";
import { Spinner } from "~/lib/atoms/Spinner";

import styles from "./RMarketDepthChart.module.css";

type RMarketDepthChartProps = {
  asset: AssetType;
};

type DepthPoint = {
  amount: number;
  price: number;
  side: "ask" | "bid";
  total: number;
  volume: number;
};

type ChartGeometry = {
  baselineY: number;
  height: number;
  left: number;
  maxPrice: number;
  maxVolume: number;
  minPrice: number;
  plotHeight: number;
  plotWidth: number;
  top: number;
  width: number;
};

const CHART_WIDTH = 870;
const CHART_HEIGHT = 200;
const CHART_LEFT = 42;
const CHART_RIGHT = 42;
const CHART_TOP = 12;
const CHART_BASELINE = 157;
const Y_TICK_COUNT = 5;
const X_TICK_COUNT = 6;
const SCALE_STEP = 0.5;

const formatNumber = (value: number, maximumFractionDigits = 2) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits,
    minimumFractionDigits: 0,
  }).format(value);

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value);

const getCumulativeDepth = (
  levels: OrderbookDepthLevelType[],
  side: "ask" | "bid"
): DepthPoint[] => {
  const sortedLevels = [...levels].sort((left, right) =>
    side === "bid" ? right.price - left.price : left.price - right.price
  );
  let volume = 0;

  return sortedLevels
    .map((level) => {
      volume += level.amount;

      return {
        amount: level.amount,
        price: level.price,
        side,
        total: level.total_quote,
        volume,
      };
    })
    .sort((left, right) => left.price - right.price);
};

const getMidPrice = (
  bestBid: number,
  bestAsk: number,
  bids: DepthPoint[],
  asks: DepthPoint[]
) => {
  const bid = bestBid || bids.at(-1)?.price || 0;
  const ask = bestAsk || asks[0]?.price || 0;

  if (bid && ask) return (bid + ask) / 2;

  return bid || ask;
};

const createStepPath = (
  points: DepthPoint[],
  xForPrice: (price: number) => number,
  yForVolume: (volume: number) => number
) => {
  if (!points.length) return "";

  return points.reduce<string>((path, point, index) => {
    const x = xForPrice(point.price);
    const y = yForVolume(point.volume);

    if (index === 0) return `M ${x} ${y}`;

    return `${path} H ${x} V ${y}`;
  }, "");
};

export function RMarketDepthChart({ asset }: RMarketDepthChartProps) {
  const { loading, orderbookDepth } = useOrderbookDepth({
    tokenAddress: asset.address,
  });
  const [scale, setScale] = useState(1);
  const [hoveredPoint, setHoveredPoint] = useState<DepthPoint | null>(null);
  const chartCanvasRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipSize, setTooltipSize] = useState({ height: 0, width: 0 });
  const gradientId = useId();

  const { asks, bids, midPrice, quoteSymbol } = useMemo(() => {
    const nextBids = getCumulativeDepth(orderbookDepth?.bids ?? [], "bid");
    const nextAsks = getCumulativeDepth(orderbookDepth?.asks ?? [], "ask");

    return {
      asks: nextAsks,
      bids: nextBids,
      midPrice: getMidPrice(
        orderbookDepth?.best_bid ?? 0,
        orderbookDepth?.best_ask ?? 0,
        nextBids,
        nextAsks
      ),
      quoteSymbol: orderbookDepth?.quote_token.symbol ?? "USDT",
    };
  }, [orderbookDepth]);

  const geometry = useMemo<ChartGeometry | null>(() => {
    const prices = [...bids, ...asks].map((point) => point.price);
    const volumes = [...bids, ...asks].map((point) => point.volume);

    if (!prices.length || !midPrice) return null;

    const largestDistance = Math.max(
      midPrice - Math.min(...prices),
      Math.max(...prices) - midPrice,
      midPrice * 0.01
    );
    const maxVolume = Math.max(1, Math.max(...volumes) / scale);

    return {
      baselineY: CHART_BASELINE,
      height: CHART_HEIGHT,
      left: CHART_LEFT,
      maxPrice: midPrice + largestDistance * 1.08,
      maxVolume,
      minPrice: midPrice - largestDistance * 1.08,
      plotHeight: CHART_BASELINE - CHART_TOP,
      plotWidth: CHART_WIDTH - CHART_LEFT - CHART_RIGHT,
      top: CHART_TOP,
      width: CHART_WIDTH,
    };
  }, [asks, bids, midPrice, scale]);

  const tooltipPosition = useMemo(() => {
    if (
      !hoveredPoint ||
      !chartCanvasRef.current ||
      !geometry ||
      !tooltipSize.width ||
      !tooltipSize.height
    ) {
      return null;
    }

    const canvasWidth = chartCanvasRef.current.clientWidth;
    const canvasHeight = chartCanvasRef.current.clientHeight;
    const tooltipWidth = tooltipSize.width;
    const tooltipHeight = tooltipSize.height;
    const pointX =
      ((geometry.left +
        ((hoveredPoint.price - geometry.minPrice) /
          (geometry.maxPrice - geometry.minPrice)) *
          geometry.plotWidth) /
        CHART_WIDTH) *
      canvasWidth;
    const pointY =
      (Math.max(
        geometry.top,
        geometry.baselineY -
          (hoveredPoint.volume / geometry.maxVolume) * geometry.plotHeight
      ) /
        CHART_HEIGHT) *
      canvasHeight;
    const verticalOffset = 12;
    const edgePadding = 8;

    let left = pointX - tooltipWidth / 2;

    left = Math.max(
      edgePadding,
      Math.min(left, canvasWidth - tooltipWidth - edgePadding)
    );

    let top = pointY - tooltipHeight - verticalOffset;

    if (top < edgePadding) {
      top = pointY + verticalOffset;
    }

    top = Math.max(
      edgePadding,
      Math.min(top, canvasHeight - tooltipHeight - edgePadding)
    );

    return { left, top };
  }, [geometry, hoveredPoint, tooltipSize.height, tooltipSize.width]);

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

  if (loading && !orderbookDepth) {
    return (
      <div className={styles.state} role="status" aria-label="Loading market depth">
        <Spinner size={32} />
      </div>
    );
  }

  if (!geometry || !orderbookDepth) {
    return <p className={styles.state}>No market depth available.</p>;
  }

  const xForPrice = (price: number) =>
    geometry.left +
    ((price - geometry.minPrice) / (geometry.maxPrice - geometry.minPrice)) *
      geometry.plotWidth;
  const yForVolume = (volume: number) =>
    Math.max(
      geometry.top,
      geometry.baselineY -
        (volume / geometry.maxVolume) * geometry.plotHeight
    );
  const bidPath = createStepPath(bids, xForPrice, yForVolume);
  const askPath = createStepPath(asks, xForPrice, yForVolume);
  const bidAreaPath = bidPath
    ? `${bidPath} L ${xForPrice(bids.at(-1)?.price ?? midPrice)} ${geometry.baselineY} L ${xForPrice(bids[0]?.price ?? midPrice)} ${geometry.baselineY} Z`
    : "";
  const askAreaPath = askPath
    ? `${askPath} L ${xForPrice(asks.at(-1)?.price ?? midPrice)} ${geometry.baselineY} L ${xForPrice(asks[0]?.price ?? midPrice)} ${geometry.baselineY} Z`
    : "";
  const xTicks = Array.from({ length: X_TICK_COUNT + 1 }, (_, index) =>
    geometry.minPrice +
    ((geometry.maxPrice - geometry.minPrice) * index) / X_TICK_COUNT
  );
  const yTicks = Array.from({ length: Y_TICK_COUNT + 1 }, (_, index) =>
    (geometry.maxVolume * (Y_TICK_COUNT - index)) / Y_TICK_COUNT
  );

  return (
    <section aria-label="Market depth chart" className={styles.chart}>
      <div className={styles.chartCanvas} ref={chartCanvasRef}>
        <div className={styles.midPrice}>
          <button
            aria-label="Decrease chart scale"
            className={styles.scaleButton}
            disabled={scale <= SCALE_STEP}
            onClick={() => setScale((value) => Math.max(SCALE_STEP, value - SCALE_STEP))}
            type="button"
          >
            −
          </button>
          <span>
            <strong>{`${formatNumber(midPrice, 4)} ${quoteSymbol}`}</strong>
            <small>Mid Market Price</small>
          </span>
          <button
            aria-label="Increase chart scale"
            className={styles.scaleButton}
            onClick={() => setScale((value) => Math.min(3, value + SCALE_STEP))}
            type="button"
          >
            +
          </button>
        </div>
        {hoveredPoint ? (
          <div
            className={styles.tooltip}
            ref={tooltipRef}
            style={tooltipPosition ?? undefined}
          >
            <strong>{`$${formatCurrency(hoveredPoint.price)}`}</strong>
            <div className={styles.tooltipDetails}>
              <span className={styles.tooltipColumn}>
                <span>
                  {hoveredPoint.side === "bid"
                    ? "Can be sold"
                    : "Can be bought"}
                </span>
                <span>{`${formatCurrency(hoveredPoint.amount)} ${asset.metadata.symbol}`}</span>
              </span>
              <span aria-hidden="true" className={styles.tooltipDivider} />
              <span className={styles.tooltipColumn}>
                <span>For a total of</span>
                <span>{`$${formatCurrency(hoveredPoint.total)}`}</span>
              </span>
            </div>
          </div>
        ) : null}
        <svg
          aria-label="Cumulative buy and sell order volume by price"
          className={styles.svg}
          onMouseLeave={() => setHoveredPoint(null)}
          onMouseMove={(event) => {
            const bounds = event.currentTarget.getBoundingClientRect();
            const cursorX = ((event.clientX - bounds.left) / bounds.width) * CHART_WIDTH;
            const price =
              geometry.minPrice +
              ((cursorX - geometry.left) / geometry.plotWidth) *
                (geometry.maxPrice - geometry.minPrice);
            const nearestPoint = [...bids, ...asks].reduce<DepthPoint | null>(
              (nearest, point) =>
                !nearest || Math.abs(point.price - price) < Math.abs(nearest.price - price)
                  ? point
                  : nearest,
              null
            );

            setHoveredPoint((currentPoint) =>
              currentPoint?.price === nearestPoint?.price &&
              currentPoint?.side === nearestPoint?.side
                ? currentPoint
                : nearestPoint
            );
          }}
          preserveAspectRatio="none"
          role="img"
          viewBox={`0 0 ${geometry.width} ${geometry.height}`}
        >
          <defs>
            <linearGradient id={`${gradientId}-bid`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="var(--r-color-green-500)" stopOpacity="0.28" />
              <stop offset="1" stopColor="var(--r-color-green-500)" stopOpacity="0.06" />
            </linearGradient>
            <linearGradient id={`${gradientId}-ask`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="var(--r-color-red-500)" stopOpacity="0.28" />
              <stop offset="1" stopColor="var(--r-color-red-500)" stopOpacity="0.06" />
            </linearGradient>
          </defs>
          {yTicks.map((value) => (
            <g key={value}>
              <text className={styles.axisLabel} x="0" y={yForVolume(value) + 3}>
                {formatNumber(value)}
              </text>
              <text className={styles.axisLabel} textAnchor="end" x={CHART_WIDTH} y={yForVolume(value) + 3}>
                {formatNumber(value)}
              </text>
            </g>
          ))}
          <g>
            {bidAreaPath ? <path d={bidAreaPath} fill={`url(#${gradientId}-bid)`} /> : null}
            {askAreaPath ? <path d={askAreaPath} fill={`url(#${gradientId}-ask)`} /> : null}
            {bidPath ? <path className={styles.bidLine} d={bidPath} /> : null}
            {askPath ? <path className={styles.askLine} d={askPath} /> : null}
          </g>
          {hoveredPoint ? (
            <>
              <line
                className={styles.crosshair}
                x1={xForPrice(hoveredPoint.price)}
                x2={xForPrice(hoveredPoint.price)}
                y1={geometry.top}
                y2={geometry.baselineY}
              />
              <circle
                className={
                  hoveredPoint.side === "bid"
                    ? styles.bidPoint
                    : styles.askPoint
                }
                cx={xForPrice(hoveredPoint.price)}
                cy={yForVolume(hoveredPoint.volume)}
                r="5"
              />
            </>
          ) : null}
          <line
            className={styles.midLine}
            x1={xForPrice(midPrice)}
            x2={xForPrice(midPrice)}
            y1="49"
            y2={geometry.baselineY}
          />
          <line className={styles.xAxis} x1="0" x2={CHART_WIDTH} y1="169" y2="169" />
          {xTicks.map((price) => (
            <text className={styles.axisLabel} key={price} textAnchor="middle" x={xForPrice(price)} y="187">
              {formatNumber(price)}
            </text>
          ))}
        </svg>
      </div>
    </section>
  );
}
