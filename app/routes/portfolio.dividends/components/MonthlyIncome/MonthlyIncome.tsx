import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { UTCTimestamp } from "lightweight-charts";

import Money from "~/lib/atoms/Money";
import { RText } from "~/lib/atoms/RTypography/RText";

import styles from "./styles.module.css";

export type MonthlyIncomeAsset = {
  amount: number;
  symbol: string;
};

export type MonthlyIncomeDataPoint = {
  assets: MonthlyIncomeAsset[];
  date: string;
  value: number;
};

export type MonthlyIncomeProps = {
  data: MonthlyIncomeDataPoint[];
};

type ChartPoint = MonthlyIncomeDataPoint & {
  time: UTCTimestamp;
};

type ChartHover = {
  point: MonthlyIncomeDataPoint;
  x: number;
};

const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "short" });
const fullDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

function getChartPoints(data: MonthlyIncomeDataPoint[]): ChartPoint[] {
  return data
    .map((point) => ({
      ...point,
      time: Math.floor(new Date(point.date).getTime() / 1000) as UTCTimestamp,
    }))
    .filter(
      (point) => Number.isFinite(point.time) && Number.isFinite(point.value)
    )
    .sort((firstPoint, secondPoint) => firstPoint.time - secondPoint.time);
}

function getMonthLabel(date: string) {
  return monthFormatter.format(new Date(date));
}

function getBarHeight(value: number, maximumValue: number) {
  return Math.max(30, (value / maximumValue) * 160);
}

function MonthlyIncomeTooltip({ point, x }: ChartHover) {
  return (
    <div className={styles.tooltip} style={{ left: x }}>
      <div className={styles.tooltipSummary}>
        <RText size="body-s" weight="medium">
          {fullDateFormatter.format(new Date(point.date))}
        </RText>
        <RText color="neutral-700" size="body-s">
          $
          <Money fiat tooltip={false}>
            {point.value}
          </Money>{" "}
          across <Money tooltip={false}>{point.assets.length}</Money> assets
        </RText>
      </div>
      <div className={styles.tooltipDivider} />
      <div className={styles.assetList}>
        {point.assets.map((asset) => (
          <div className={styles.asset} key={asset.symbol}>
            <RText size="body-xs">{asset.symbol}</RText>
            <RText size="body-xs">
              $
              <Money fiat tooltip={false}>
                {asset.amount}
              </Money>
            </RText>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MonthlyIncome({ data }: MonthlyIncomeProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<ChartHover | null>(null);
  const chartPoints = useMemo(() => getChartPoints(data), [data]);
  const maximumValue = Math.max(...data.map((point) => point.value), 1);

  useEffect(() => {
    const chartContainer = chartRef.current;

    if (!chartContainer || chartPoints.length === 0) return;

    let isUnmounted = false;
    let cleanup = () => {};

    void import("lightweight-charts").then(
      ({ ColorType, CrosshairMode, HistogramSeries, createChart }) => {
        if (isUnmounted) return;

        const computedStyles = window.getComputedStyle(chartContainer);
        const chart = createChart(chartContainer, {
          autoSize: true,
          crosshair: {
            horzLine: { visible: false },
            mode: CrosshairMode.Normal,
            vertLine: { visible: false },
          },
          grid: {
            horzLines: { visible: false },
            vertLines: { visible: false },
          },
          handleScale: false,
          handleScroll: false,
          height: chartContainer.clientHeight,
          layout: {
            attributionLogo: false,
            background: { color: "transparent", type: ColorType.Solid },
            fontFamily: computedStyles.getPropertyValue("--r-font-body").trim(),
            fontSize:
              Number.parseFloat(
                computedStyles.getPropertyValue("--r-font-size-body-s")
              ) || 12,
            textColor: "transparent",
          },
          leftPriceScale: { visible: false },
          rightPriceScale: { visible: false },
          timeScale: {
            barSpacing: 80,
            borderVisible: false,
            fixLeftEdge: true,
            fixRightEdge: true,
            minBarSpacing: 48,
            ticksVisible: false,
            visible: false,
          },
          width: chartContainer.clientWidth,
        });
        const series = chart.addSeries(HistogramSeries, {
          base: 0,
          color: "transparent",
          lastValueVisible: false,
          priceLineVisible: false,
          priceScaleId: "",
        });

        series.setData(chartPoints);
        chart.priceScale("").applyOptions({
          scaleMargins: { bottom: 0, top: 0.18 },
        });
        chart.timeScale().fitContent();

        // chart.subscribeCrosshairMove((params) => {
        //   if (typeof params.time !== "number" || !params.point) {
        //     setHover(null);
        //     return;
        //   }
        //
        //   const point = chartPoints.find((item) => item.time === params.time);
        //   setHover(point ? { point, x: params.point.x } : null);
        // });

        cleanup = () => chart.remove();
      }
    );

    return () => {
      isUnmounted = true;
      cleanup();
    };
  }, [chartPoints]);

  if (data.length === 0) return null;

  return (
    <section
      className={styles.monthlyIncome}
      aria-label="Monthly income"
      style={{ "--monthly-income-points": data.length } as CSSProperties}
    >
      <RText className={styles.title} size="body-m" weight="medium">
        Monthly Income
      </RText>
      <div className={styles.chartArea}>
        <div className={styles.bars} aria-hidden="true">
          {data.map((point) => (
            <div className={styles.barColumn} key={point.date}>
              <div className={styles.barGroup}>
                <RText className={styles.valueLabel} size="body-s">
                  $
                  <Money fiat tooltip={false}>
                    {point.value}
                  </Money>
                </RText>
                <div
                  className={styles.bar}
                  style={{
                    height: `${getBarHeight(point.value, maximumValue)}px`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className={styles.chart} ref={chartRef} />
        {hover && <MonthlyIncomeTooltip {...hover} />}
      </div>
      <div className={styles.monthLabels} aria-hidden="true">
        {data.map((point) => (
          <RText
            className={styles.monthLabel}
            key={point.date}
            color="neutral-700"
            size="body-sm"
          >
            {getMonthLabel(point.date)}
          </RText>
        ))}
      </div>
    </section>
  );
}
