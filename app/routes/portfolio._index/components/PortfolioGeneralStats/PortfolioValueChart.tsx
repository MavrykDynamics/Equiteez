import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchWalletPortfolioHistory } from "~/lib/apis/rwa";
import { RIcon } from "~/lib/atoms/RIcon";
import { Spinner } from "~/lib/atoms/Spinner";
import { RText } from "~/lib/atoms/RTypography/RText";
import { useAuthContext } from "~/providers/AuthProvider/auth.provider";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import {
  AssetPriceChart,
  type AssetPriceChartPoint,
  type AssetPriceChartHover,
} from "~/routes/discover/components/AssetPriceChart/AssetPriceChart";

import styles from "./styles.module.css";
import Money from "~/lib/atoms/Money";

type PortfolioChartPeriod = "1d" | "7d" | "30d" | "all" | "ytd";

const PORTFOLIO_CHART_PERIODS: Array<{
  label: string;
  value: PortfolioChartPeriod;
}> = [
  { label: "1D", value: "1d" },
  { label: "7D", value: "7d" },
  { label: "30D", value: "30d" },
  { label: "YTD", value: "ytd" },
  { label: "ALL", value: "all" },
];

function formatTooltipDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
  }).format(date);
}

export function PortfolioValueChart() {
  const { isAuthenticated } = useAuthContext();
  const { userAddress } = useUserContext();
  const [period, setPeriod] = useState<PortfolioChartPeriod>("7d");
  const [hoveredPoint, setHoveredPoint] = useState<AssetPriceChartHover | null>(
    null
  );
  const chartCanvasRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipSize, setTooltipSize] = useState({ height: 0, width: 0 });

  const portfolioHistoryQuery = useQuery({
    queryKey: ["rwa-wallet-portfolio-history", userAddress, period],
    queryFn: () =>
      fetchWalletPortfolioHistory({
        walletAddress: userAddress || "",
        range: period,
      }),
    enabled: isAuthenticated && Boolean(userAddress),
  });

  const points = useMemo<AssetPriceChartPoint[]>(
    () =>
      (portfolioHistoryQuery.data?.points ?? []).map((point) => ({
        p: point.value,
        t: point.t,
        usd: point.value,
      })),
    [portfolioHistoryQuery.data?.points]
  );
  const changeAbs = portfolioHistoryQuery.data?.change_abs ?? 0;
  const changePct = portfolioHistoryQuery.data?.change_pct ?? 0;
  const hasChartData = points.length > 0;
  const isPositiveChange = changeAbs >= 0;
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
          <RIcon
            name={isPositiveChange ? "trending-up" : "trending-down"}
            size="small"
            className={
              isPositiveChange ? styles.changeIconPositive : styles.changeIconNegative
            }
          />
          <RText
            color={isPositiveChange ? "green-500" : "red-500"}
            size="body-sm"
          >
            <Money fiat tooltip={false}>
              {changeAbs}
            </Money>{" "}
            ({isPositiveChange ? "+" : "-"}
            {Math.abs(changePct)}%)
          </RText>
        </div>
      </div>
      <div className={styles.chartCanvas} ref={chartCanvasRef}>
        {portfolioHistoryQuery.isLoading ||
        portfolioHistoryQuery.isFetching ||
        portfolioHistoryQuery.isPending ? (
          <div className={styles.chartLoader} role="status" aria-label="Loading chart">
            <Spinner size={32} />
          </div>
        ) : !hasChartData ? (
          <div className={styles.chartEmpty} role="status">
            <RText color="neutral-700" size="body-sm">
              No chart data available
            </RText>
          </div>
        ) : (
          <AssetPriceChart
            className={styles.chart}
            onHover={handleChartHover}
            points={points}
            priceDecimals={2}
            showPriceScale={false}
            showTimeScale={false}
            tone={isPositiveChange ? "positive" : "negative"}
          />
        )}
        {hasChartData && hoveredPoint ? (
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
