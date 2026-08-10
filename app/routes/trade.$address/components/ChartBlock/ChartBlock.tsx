import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import { OrderBookToggleButton } from "~/lib/organisms/OrderBookPopup/OrderBookPopup";

import { OrderbookBar } from "~/routes/trade.$address/components/ChartBlock/OrderbookBar";
import { PriceChart } from "~/routes/trade.$address/components/ChartBlock/PriceChart";

import styles from "./styles.module.css";
import { useOrderbookDepth } from "~/lib/apis/rwa";
import {
  getOrderBookFooterSummary,
  ORDER_BOOK_FETCH_LIMIT,
} from "~/lib/organisms/OrderBookPopup/OrderBookTable";
import { useMemo } from "react";

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
  const { orderbookDepth } = useOrderbookDepth({
    limit: ORDER_BOOK_FETCH_LIMIT,
    tokenAddress: asset.address,
    refetchInterval: 10_000,
  });
  const footerSummary = useMemo(
    () =>
      getOrderBookFooterSummary({
        orderbookDepth,
      }),
    [orderbookDepth]
  );
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
      {asset.profile.lifecycle === "secondary_market" && (
        <OrderbookBar
          buyPercentage={footerSummary.buyPercentage}
          sellPercentage={footerSummary.sellPercentage}
        />
      )}
    </div>
  );
}
