import { useState } from "react";

import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";

import type { WalletPortfolioAssetType } from "~/lib/apis/rwa/wallet/wallet.types";
import styles from "./styles.module.css";
import Money from "~/lib/atoms/Money";

const DONUT_SIZE = 263;
const DONUT_CENTER_SIZE = 116;
const DONUT_OUTER_RADIUS = DONUT_SIZE / 2;
const DONUT_INNER_RADIUS = DONUT_CENTER_SIZE / 2;
const DONUT_STROKE_WIDTH = DONUT_OUTER_RADIUS - DONUT_INNER_RADIUS;
const DONUT_RADIUS =
  DONUT_INNER_RADIUS + DONUT_STROKE_WIDTH / 2;

type AllAssetsChartProps = {
  assets: WalletPortfolioAssetType[];
  portfolioTotal: number;
};

const chartColors = [
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

const separatorDegrees = 2;
const minimumSliceDegrees = 4;

type ChartAsset = Pick<
  WalletPortfolioAssetType,
  "token_address" | "symbol" | "share_pct" | "balance"
> & {
  members?: WalletPortfolioAssetType[];
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

export function AssetsChart({ assets, portfolioTotal }: AllAssetsChartProps) {
  const [isOtherDetailsVisible, setIsOtherDetailsVisible] = useState(false);
  const orderedAssets = [...assets]
    .filter(
      (asset) => Number.isFinite(asset.share_pct) && Number.isFinite(asset.balance)
    )
    .filter((asset) => asset.share_pct > 0 && asset.balance > 0)
    .sort((firstAsset, secondAsset) => secondAsset.share_pct - firstAsset.share_pct);
  const otherMembers =
    orderedAssets.length > 9
      ? orderedAssets.slice(9)
      : orderedAssets.filter((asset) => asset.share_pct < 1);
  const otherMemberIds = new Set(
    otherMembers.map((asset) => asset.token_address)
  );
  const primaryAssets = orderedAssets.filter(
    (asset) => !otherMemberIds.has(asset.token_address)
  );
  const otherSharePct = otherMembers.reduce(
    (sum, asset) => sum + asset.share_pct,
    0
  );
  const otherBalance = otherMembers.reduce(
    (sum, asset) => sum + asset.balance,
    0
  );
  const chartAssets: ChartAsset[] = [
    ...primaryAssets.map((item) => ({
      ...item,
      symbol: item.symbol.toUpperCase(),
    })),
    ...(otherSharePct > 0
      ? [
          {
            balance: otherBalance,
            share_pct: otherSharePct,
            token_address: "portfolio-other",
            members: otherMembers,
            symbol: "Other",
          },
        ]
      : []),
  ];
  const distributableDegrees = Math.max(
    0,
    360 - chartAssets.length * minimumSliceDegrees
  );
  let currentAngle = 0;
  const chartSlices = chartAssets.map((asset, index) => {
    const nextAngle =
      currentAngle +
      minimumSliceDegrees +
      (asset.share_pct / 100) * distributableDegrees;
    const endAngle = Math.max(currentAngle, nextAngle - separatorDegrees);
    const slice = {
      color: chartColors[index],
      endAngle,
      startAngle: currentAngle,
      token_address: asset.token_address,
    };

    currentAngle = nextAngle;
    return slice;
  });

  return (
    <aside className={styles.chartPanel} aria-label="Portfolio allocation">
      <div className={styles.donut}>
        <svg
          aria-hidden="true"
          className={styles.donutSvg}
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
              <path
                key={slice.token_address}
                d={describeArcPath(
                  DONUT_SIZE / 2,
                  DONUT_SIZE / 2,
                  DONUT_RADIUS,
                  slice.startAngle,
                  slice.endAngle
                )}
                fill="none"
                stroke={slice.color}
                strokeWidth={DONUT_STROKE_WIDTH}
              />
            ) : null
          )}
        </svg>
        <div className={styles.donutCenter}>
          <div className={styles.donutCenterBg} />
          <RHeading size="h6" weight="medium" className={styles.donutCenterText}>
            $
            <Money fiat tooltip={false} shortened>
              {portfolioTotal}
            </Money>
          </RHeading>
        </div>
      </div>
      <div className={styles.legend}>
        {chartAssets.map((asset, index) => (
          <div
            className={
              asset.members
                ? `${styles.legendItem} ${styles.otherLegendItem}`
                : styles.legendItem
            }
            key={asset.token_address}
            onMouseEnter={() => asset.members && setIsOtherDetailsVisible(true)}
            onMouseLeave={() => setIsOtherDetailsVisible(false)}
          >
            <span
              aria-hidden="true"
              className={styles.legendColor}
              style={{
                backgroundColor: chartColors[index],
              }}
            />
            <RText
              className={styles.legendPercentage}
              size="body-sm"
              weight="medium"
            >
              <Money fiat tooltip={false}>
                {asset.share_pct}
              </Money>
              %
            </RText>
            <span>
              <RText className={styles.blockText} size="body-s">
                {asset.symbol}
              </RText>
              <RText color="neutral-700" size="body-s">
                $
                <Money fiat tooltip={false}>
                  {asset.balance}
                </Money>
              </RText>
            </span>
            {asset.members && isOtherDetailsVisible ? (
              <div className={styles.otherTooltip} role="tooltip">
                <div className={styles.otherTooltipList}>
                  {asset.members.map((member) => (
                    <div
                      className={styles.otherTooltipRow}
                      key={member.token_address}
                    >
                      <RText size="body-s" weight="medium">
                        <Money fiat tooltip={false}>
                          {member.share_pct}
                        </Money>
                        %
                      </RText>
                      <div className={styles.otherTooltipRowContent}>
                        <RText className={styles.blockText} size="body-xs">
                          {member.symbol.toUpperCase()}
                        </RText>
                        <RText color="neutral-700" size="body-xs">
                          $
                          <Money fiat tooltip={false}>
                            {member.balance}
                          </Money>
                        </RText>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </aside>
  );
}
