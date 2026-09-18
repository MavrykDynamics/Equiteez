import { useState, type Ref } from "react";

import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import { OrderBookToggleButton } from "~/lib/organisms/OrderBookPopup/OrderBookPopup";
import clsx from "clsx";

import { PriceChart } from "~/routes/trade.$address/components/ChartBlock/PriceChart";

import styles from "./styles.module.css";

type ChartBlockProps = {
  asset: AssetType;
  isOrderBookOpen: boolean;
  onOrderBookToggle: () => void;
  orderBookContainerRef: Ref<HTMLDivElement>;
};

const CHART_ORDER_BOOK_TOGGLE_LABELS = {
  hide: "Order Book",
  show: "Order Book",
};

export function ChartBlock({
  asset,
  isOrderBookOpen,
  onOrderBookToggle,
  orderBookContainerRef,
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
        orderBookContent={
          <div
            ref={orderBookContainerRef}
            className={styles.orderBookContainer}
          />
        }
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
