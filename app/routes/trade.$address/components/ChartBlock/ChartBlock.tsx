import { useState } from "react";

import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import { OrderBookToggleButton } from "~/lib/organisms/OrderBookPopup/OrderBookPopup";
import clsx from "clsx";

import { PriceChart } from "~/routes/trade.$address/components/ChartBlock/PriceChart";

import styles from "./styles.module.css";

type ChartBlockProps = {
  asset: AssetType;
  isOrderBookOpen: boolean;
  onOrderBookToggle: () => void;
};

const CHART_ORDER_BOOK_TOGGLE_LABELS = {
  hide: "Order Book",
  show: "Order Book",
};

export function ChartBlock({
  asset,
  isOrderBookOpen,
  onOrderBookToggle,
}: ChartBlockProps) {
  const [chartTone, setChartTone] = useState<"positive" | "negative">(
    "positive"
  );

  return (
    <div
      className={clsx(
        styles.wrapper,
        chartTone === "negative"
          ? styles.negativeWrapper
          : styles.positiveWrapper
      )}
    >
      <PriceChart
        asset={asset}
        onToneChange={setChartTone}
        orderBookControl={
          <OrderBookToggleButton
            className={styles.orderBookToggle}
            isOpen={isOrderBookOpen}
            labels={CHART_ORDER_BOOK_TOGGLE_LABELS}
            onClick={onOrderBookToggle}
          />
        }
      />
    </div>
  );
}
