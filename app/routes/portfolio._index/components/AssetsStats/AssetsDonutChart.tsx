import { useState } from "react";

import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import Money from "~/lib/atoms/Money";

import styles from "./styles.module.css";

const DONUT_SIZE = 263;
const DONUT_CENTER_SIZE = 116;
const DONUT_OUTER_RADIUS = DONUT_SIZE / 2;
const DONUT_INNER_RADIUS = DONUT_CENTER_SIZE / 2;
const DONUT_STROKE_WIDTH = DONUT_OUTER_RADIUS - DONUT_INNER_RADIUS;
const DONUT_RADIUS = DONUT_INNER_RADIUS + DONUT_STROKE_WIDTH / 2;
const SEPARATOR_DEGREES = 2;
const MINIMUM_SLICE_DEGREES = 4;
const HOVER_RADIUS_INCREASE = 6;

export const chartColors = [
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

export type AssetsDonutChartAsset = {
  balance: number;
  share_pct: number;
  symbol: string;
  token_address: string;
};

type AssetsDonutChartProps = {
  chartAssets: AssetsDonutChartAsset[];
  portfolioTotal: number;
};

function getPolarPoint(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArcPath(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number
) {
  const start = getPolarPoint(centerX, centerY, radius, startAngle);
  const end = getPolarPoint(centerX, centerY, radius, endAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  return [
    "M",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    1,
    end.x,
    end.y,
  ].join(" ");
}

export function AssetsDonutChart({
  activeTokenAddress,
  chartAssets,
  onActiveTokenAddressChange,
  portfolioTotal,
}: AssetsDonutChartProps & {
  activeTokenAddress?: string;
  onActiveTokenAddressChange?: (tokenAddress?: string) => void;
}) {
  const [uncontrolledActiveTokenAddress, setUncontrolledActiveTokenAddress] =
    useState<string>();
  const currentActiveTokenAddress =
    activeTokenAddress ?? uncontrolledActiveTokenAddress;
  const setActiveTokenAddress = (tokenAddress?: string) => {
    onActiveTokenAddressChange?.(tokenAddress);
    setUncontrolledActiveTokenAddress(tokenAddress);
  };
  const distributableDegrees = Math.max(
    0,
    360 - chartAssets.length * MINIMUM_SLICE_DEGREES
  );
  let currentAngle = 0;
  const chartSlices = chartAssets.map((asset, index) => {
    const nextAngle =
      currentAngle +
      MINIMUM_SLICE_DEGREES +
      (asset.share_pct / 100) * distributableDegrees;
    const endAngle = Math.max(currentAngle, nextAngle - SEPARATOR_DEGREES);
    const slice = {
      color: chartColors[index],
      endAngle,
      startAngle: currentAngle,
      symbol: asset.symbol,
      token_address: asset.token_address,
    };

    currentAngle = nextAngle;
    return slice;
  });

  return (
    <div className={styles.donut}>
      <svg
        aria-label="Portfolio allocation"
        className={styles.donutSvg}
        onMouseLeave={() => setActiveTokenAddress(undefined)}
        role="group"
        viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`}
      >
        <circle
          cx={DONUT_SIZE / 2}
          cy={DONUT_SIZE / 2}
          r={DONUT_RADIUS}
          className={styles.donutTrack}
          strokeWidth={DONUT_STROKE_WIDTH}
        />
        {chartSlices.map((slice) =>
          slice.endAngle > slice.startAngle ? (
            (() => {
              const isActive =
                currentActiveTokenAddress === slice.token_address;
              const outerRadius =
                DONUT_OUTER_RADIUS +
                (isActive ? HOVER_RADIUS_INCREASE : 0);
              const strokeWidth = outerRadius - DONUT_INNER_RADIUS;
              const radius = DONUT_INNER_RADIUS + strokeWidth / 2;

              return (
                <path
                  aria-label={slice.symbol}
                  className={styles.donutSlice}
                  key={slice.token_address}
                  d={describeArcPath(
                    DONUT_SIZE / 2,
                    DONUT_SIZE / 2,
                    radius,
                    slice.startAngle,
                    slice.endAngle
                  )}
                  fill="none"
                  onBlur={() => setActiveTokenAddress(undefined)}
                  onFocus={() => setActiveTokenAddress(slice.token_address)}
                  onMouseEnter={() => setActiveTokenAddress(slice.token_address)}
                  role="button"
                  stroke={slice.color}
                  strokeWidth={strokeWidth}
                  tabIndex={0}
                />
              );
            })()
          ) : null
        )}
      </svg>
      <div className={styles.donutCenter}>
        <div className={styles.donutCenterBg} />
        <RHeading
          size="h6"
          weight="medium"
          className={styles.donutCenterText}
        >
          $
          <Money fiat tooltip={false} shortened>
            {portfolioTotal}
          </Money>
        </RHeading>
      </div>
    </div>
  );
}
