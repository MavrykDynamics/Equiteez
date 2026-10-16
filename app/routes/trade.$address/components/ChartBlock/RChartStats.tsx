import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import Money from "~/lib/atoms/Money";
import { RMetricCard } from "~/lib/molecules/RMetricCard/RMetricCard";
import { formatRawSupply } from "~/lib/utils/formaters";

import styles from "./RChartStats.module.css";

type RChartStatsProps = {
  asset: Pick<
    AssetType,
    | "apy"
    | "finance"
    | "metadata"
    | "total_supply"
    | "holders_count"
    | "profile"
  >;
};

function formatProfileValue(value: string) {
  const normalizedValue = value.split("_").join(" ").trim();

  if (!normalizedValue) {
    return "—";
  }

  return normalizedValue.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function RChartStats({ asset }: RChartStatsProps) {
  const totalSupply = formatRawSupply(
    asset.total_supply,
    asset.metadata.decimals
  );
  const metrics = [
    { label: "Annual yield (APY)", value: `${asset.apy.toFixed(2)}%` },
    {
      label: "Value per token",
      value:
        asset.finance.value_per_token === undefined ? (
          "—"
        ) : (
          <>
            $
            <Money fiat tooltip={false}>
              {asset.finance.value_per_token}
            </Money>
          </>
        ),
    },
    {
      label: "Total supply",
      value:
        totalSupply === undefined ? (
          "—"
        ) : (
          <Money shortened tooltip={false}>{totalSupply}</Money>
        ),
    },
    {
      label: "Holders",
      value: <Money tooltip={false}>{asset.holders_count}</Money>,
    },
    {
      label: "Asset type",
      value: formatProfileValue(asset.profile.asset_type),
    },
    { label: "Asset status", value: formatProfileValue(asset.profile.status) },
  ];

  return (
    <section className={styles.panel} aria-label="Asset statistics">
      {metrics.map(({ label, value }) => (
        <RMetricCard
          className={styles.metric}
          key={label}
          label={label}
          value={value}
        />
      ))}
    </section>
  );
}
