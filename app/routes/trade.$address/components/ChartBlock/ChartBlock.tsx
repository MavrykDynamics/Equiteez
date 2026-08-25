import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import { OrderBookToggleButton } from "~/lib/organisms/OrderBookPopup/OrderBookPopup";

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
  return (
    <div className={styles.wrapper}>
      <PriceChart
        asset={asset}
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
