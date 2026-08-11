import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";

import { RIcon } from "~/lib/atoms/RIcon";
import { RText } from "~/lib/atoms/RTypography/RText";
import {
  AssetPriceChart,
  type AssetPriceChartHover,
} from "~/routes/discover/components/AssetPriceChart/AssetPriceChart";

import {
  getMockPortfolioChartPoints,
  MOCK_PORTFOLIO_CHARTS,
  PORTFOLIO_CHART_PERIODS,
  type PortfolioChartPeriod,
} from "./PortfolioValueChart.const";
import styles from "./styles.module.css";
import Money from "~/lib/atoms/Money";

function formatTooltipDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
  }).format(date);
}

export function PortfolioValueChart() {
  const [period, setPeriod] = useState<PortfolioChartPeriod>("7d");
  const [hoveredPoint, setHoveredPoint] = useState<AssetPriceChartHover | null>(
    null
  );
  const chartCanvasRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipSize, setTooltipSize] = useState({ height: 0, width: 0 });

  const chartConfig = MOCK_PORTFOLIO_CHARTS[period];
  const points = useMemo(() => getMockPortfolioChartPoints(period), [period]);
  const handleChartHover = useCallback(
    (point: AssetPriceChartHover | null) => setHoveredPoint(point),
    []
  );
  const tooltipPosition = useMemo(() => {
    if (!hoveredPoint || !chartCanvasRef.current) return null;

    const canvas = chartCanvasRef.current;
    const edgePadding = 8;
    const verticalOffset = 12;
    let left = hoveredPoint.x - tooltipSize.width / 2;
    let top = hoveredPoint.y - tooltipSize.height - verticalOffset;

    left = Math.max(
      edgePadding,
      Math.min(left, canvas.clientWidth - tooltipSize.width - edgePadding)
    );

    if (top < edgePadding) top = hoveredPoint.y + verticalOffset;

    top = Math.max(
      edgePadding,
      Math.min(top, canvas.clientHeight - tooltipSize.height - edgePadding)
    );

    return { left, top };
  }, [hoveredPoint, tooltipSize.height, tooltipSize.width]);

  useLayoutEffect(() => {
    if (!hoveredPoint || !tooltipRef.current) return;

    const { offsetHeight: height, offsetWidth: width } = tooltipRef.current;

    setTooltipSize((current) =>
      current.height === height && current.width === width
        ? current
        : { height, width }
    );
  }, [hoveredPoint]);

  function handlePeriodChange(nextPeriod: PortfolioChartPeriod) {
    setPeriod(nextPeriod);
    setHoveredPoint(null);
  }

  return (
    <section className={styles.chartSection} aria-label="Portfolio value chart">
      <div className={styles.header}>
        <div
          aria-label="Portfolio chart range"
          className={styles.periodTabs}
          role="tablist"
        >
          {PORTFOLIO_CHART_PERIODS.map(({ label, value }) => (
            <button
              aria-selected={period === value}
              className={period === value ? styles.activePeriod : styles.period}
              key={value}
              onClick={() => handlePeriodChange(value)}
              role="tab"
              type="button"
            >
              <RText size="body-s">{label}</RText>
            </button>
          ))}
        </div>
        <div className={styles.change}>
          <RIcon name="trending-up" size="small" className={styles.changeIcon} />
          <RText color="green-500" size="body-sm">
            <Money fiat tooltip={false}>
              {chartConfig.change}
            </Money>{" "}
            (+
            {chartConfig.changePercentage}%)
          </RText>
        </div>
      </div>
      <div className={styles.chartCanvas} ref={chartCanvasRef}>
        <AssetPriceChart
          className={styles.chart}
          onHover={handleChartHover}
          points={points}
          priceDecimals={2}
          showPriceScale={false}
          showTimeScale={false}
          tone="positive"
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
              className={styles.point}
              style={{ left: hoveredPoint.x, top: hoveredPoint.y }}
            />
            <div
              className={styles.tooltip}
              ref={tooltipRef}
              role="status"
              style={tooltipPosition ?? undefined}
            >
              <RText size="body-s" weight="medium">
                <Money fiat tooltip={false}>
                  {hoveredPoint.value}
                </Money>
              </RText>
              <RText color="neutral-700" size="body-xs">
                {formatTooltipDate(hoveredPoint.time)}
              </RText>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
