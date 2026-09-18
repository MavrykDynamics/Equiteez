import Money from "~/lib/atoms/Money";
import { RMetricCard } from "~/lib/molecules/RMetricCard/RMetricCard";

import styles from "./RChartStats.module.css";

type RChartStatsProps = {
  prices: number[];
  amount: number | null;
  percentage: number | null;
  isUnavailable: boolean;
};

export function RChartStats({
  prices,
  amount,
  percentage,
  isUnavailable,
}: RChartStatsProps) {
  const hasPrices = !isUnavailable && prices.length > 0;
  const metrics = [
    { label: "Opening price", value: prices[0] },
    { label: "Latest price", value: prices.at(-1) },
    {
      label: "Period high",
      value: prices.reduce((high, price) => Math.max(high, price), -Infinity),
    },
    {
      label: "Period low",
      value: prices.reduce((low, price) => Math.min(low, price), Infinity),
    },
    { label: "Price change", value: amount, isChange: true },
    {
      label: "Percentage change",
      value: percentage,
      isChange: true,
      isPercentage: true,
    },
  ];

  return (
    <section
      className={styles.panel}
      aria-label="Selected range price statistics"
    >
      {metrics.map(({ label, value, isChange, isPercentage }) => (
        <RMetricCard
          className={styles.metric}
          key={label}
          label={label}
          value={
            hasPrices && value != null && Number.isFinite(value) ? (
              <>
                {value < 0 ? "−" : isChange && value > 0 ? "+" : ""}
                {isPercentage ? "" : "$"}
                <Money fiat tooltip={false}>
                  {Math.abs(value)}
                </Money>
                {isPercentage ? "%" : ""}
              </>
            ) : (
              "—"
            )
          }
        />
      ))}
    </section>
  );
}
