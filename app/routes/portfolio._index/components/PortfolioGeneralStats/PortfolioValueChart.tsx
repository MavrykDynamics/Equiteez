import { useMemo, useState } from "react";

import { RText } from "~/lib/atoms/RTypography/RText";

import styles from "./styles.module.css";

const periodOptions = ["1d", "1w", "1m", "6m", "1y"] as const;

const portfolioHistory = [
  149_336, 150_448, 149_784, 151_922, 151_334, 153_104, 152_672, 154_188,
  153_908, 155_233, 154_772, 156_406, 155_616, 157_168, 156_904, 158_484,
  157_942, 159_836, 159_246, 160_978, 160_364, 162_552, 161_908, 163_690,
  163_104, 165_438, 164_822, 166_970, 166_318, 168_724, 167_896, 170_282,
  169_528, 172_508,
];

export function PortfolioValueChart() {
  const [activePeriod, setActivePeriod] = useState<(typeof periodOptions)[number]>(
    "1d"
  );

  const chartPath = useMemo(() => {
    const minimum = Math.min(...portfolioHistory);
    const maximum = Math.max(...portfolioHistory);
    const range = maximum - minimum;

    return portfolioHistory
      .map((value, index) => {
        const x = (index / (portfolioHistory.length - 1)) * 100;
        const y = 100 - ((value - minimum) / range) * 86 - 7;

        return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(" ");
  }, []);

  return (
    <div className={styles.chartSection}>
      <div className={styles.header}>
        <div
          aria-label="Portfolio chart range"
          className={styles.periodTabs}
          role="tablist"
        >
          {periodOptions.map((period) => (
            <button
              aria-selected={activePeriod === period}
              className={activePeriod === period ? styles.activePeriod : styles.period}
              key={period}
              onClick={() => setActivePeriod(period)}
              role="tab"
              type="button"
            >
              <RText
                color={activePeriod === period ? "neutral-white" : "neutral-black"}
                size="body-sm"
              >
                {period}
              </RText>
            </button>
          ))}
        </div>
        <div className={styles.change}>
          <span aria-hidden="true" className={styles.positiveMarker} />
          <RText color="green-500" size="body-sm" weight="medium">
            $5,897.91 (+2.4%)
          </RText>
        </div>
      </div>
      <div className={styles.chart}>
        <svg aria-hidden="true" preserveAspectRatio="none" viewBox="0 0 100 100">
          <path
            className={styles.line}
            d={chartPath}
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div className={styles.tooltip}>
          <RText size="body-s" weight="medium">
            $155,233.00
          </RText>
          <RText color="neutral-700" size="body-xs">
            Jul 15
          </RText>
        </div>
        <span aria-hidden="true" className={styles.point} />
      </div>
    </div>
  );
}
