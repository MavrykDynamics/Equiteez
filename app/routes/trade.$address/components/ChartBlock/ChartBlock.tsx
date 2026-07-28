import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";

import { OrderbookBar } from "~/routes/trade.$address/components/ChartBlock/OrderbookBar";
import { PriceChart } from "~/routes/trade.$address/components/ChartBlock/PriceChart";

import styles from "./styles.module.css";

type ChartBlockProps = {
  asset: AssetType;
};

export function ChartBlock({ asset }: ChartBlockProps) {
  return <div className={styles.wrapper}>
    <PriceChart asset={asset} />
    <OrderbookBar buyPercentage={64} sellPercentage={36} />
  </div>
}
