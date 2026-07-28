import { useEffect, useRef } from "react";
import type { UTCTimestamp } from "lightweight-charts";

import styles from "./AssetPriceChart.module.css";

export type AssetPriceChartPoint = {
  p: number;
  t: string;
  usd: number;
};

export type AssetPriceChartHover = {
  time: Date;
  value: number;
  x: number;
  y: number;
};

type AssetPriceChartProps = {
  className?: string;
  onHover?: (hover: AssetPriceChartHover | null) => void;
  points: AssetPriceChartPoint[];
  tone: "positive" | "negative";
};

function getChartData(points: AssetPriceChartPoint[]) {
  return points
    .map((point) => ({
      time: Math.floor(new Date(point.t).getTime() / 1000) as UTCTimestamp,
      value: point.usd ?? point.p,
    }))
    .filter(
      (point) => Number.isFinite(point.time) && Number.isFinite(point.value)
    )
    .sort((firstPoint, secondPoint) => firstPoint.time - secondPoint.time);
}

export function AssetPriceChart({
  className,
  onHover,
  points,
  tone,
}: AssetPriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    let isUnmounted = false;
    let cleanup: () => void = () => {};

    void import("lightweight-charts").then(
      ({ AreaSeries, ColorType, CrosshairMode, createChart }) => {
        if (isUnmounted) return;

        const computedStyles = window.getComputedStyle(container);
        const lineColor = computedStyles
          .getPropertyValue(
            tone === "positive" ? "--r-color-green-500" : "--r-color-red-500"
          )
          .trim();
        const areaTopColor = tone === "positive" ? "#22A55B40" : "#C0453C40";
        const chart = createChart(container, {
          autoSize: true,
          crosshair: { mode: CrosshairMode.Hidden },
          grid: {
            horzLines: { visible: false },
            vertLines: { visible: false },
          },
          handleScroll: false,
          handleScale: false,
          height: container.clientHeight,
          layout: {
            attributionLogo: false,
            background: { color: "transparent", type: ColorType.Solid },
            textColor: "transparent",
          },
          leftPriceScale: { visible: false },
          rightPriceScale: { visible: false },
          timeScale: {
            borderVisible: false,
            timeVisible: false,
            visible: false,
          },
          width: container.clientWidth,
        });
        const series = chart.addSeries(AreaSeries, {
          bottomColor: "#FFFFFF",
          crosshairMarkerVisible: false,
          lastValueVisible: false,
          lineColor,
          lineWidth: 2,
          priceLineVisible: false,
          topColor: areaTopColor,
        });

        series.setData(getChartData(points));
        chart.timeScale().fitContent();

        chart.subscribeCrosshairMove((params) => {
          const chartPoint = params.point;
          const seriesPoint = params.seriesData.get(series);

          if (
            !chartPoint ||
            typeof params.time !== "number" ||
            !seriesPoint ||
            typeof seriesPoint !== "object" ||
            !("value" in seriesPoint) ||
            typeof seriesPoint.value !== "number"
          ) {
            onHover?.(null);
            return;
          }

          onHover?.({
            time: new Date(params.time * 1000),
            value: seriesPoint.value,
            x: chartPoint.x,
            y: series.priceToCoordinate(seriesPoint.value) ?? chartPoint.y,
          });
        });

        cleanup = () => {
          chart.remove();
        };
      }
    );

    return () => {
      isUnmounted = true;
      cleanup();
    };
  }, [onHover, points, tone]);

  return (
    <div className={`${styles.chart} ${className ?? ""}`} ref={containerRef} />
  );
}
