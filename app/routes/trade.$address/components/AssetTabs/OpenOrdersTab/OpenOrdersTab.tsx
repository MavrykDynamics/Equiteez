import { useCallback } from "react";

import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import {
  FreshnessSource,
  useFreshQueryInvalidation,
} from "~/lib/apis/rwa/freshness";
import {
  NotifierChannel,
  NotifierWalletEvent,
} from "~/providers/NotificationsProvider/notifications.const";
import { useNotifierEvent } from "~/providers/NotificationsProvider/hooks/useNotifierEvent";
import { OpenOrdersTab as PortfolioOpenOrdersTab } from "~/routes/portfolio.activity/components/OpenOrdersTab/OpenOrdersTab";

type OpenOrdersTabProps = {
  asset: AssetType;
};

export function OpenOrdersTab({ asset }: OpenOrdersTabProps) {
  const invalidateFreshQueries = useFreshQueryInvalidation();

  const handleOrderbookOrderUpdated = useCallback(() => {
    void invalidateFreshQueries("fetchWalletOpenOrders", {
      source: FreshnessSource.Orderbook,
    });
  }, [invalidateFreshQueries]);

  useNotifierEvent(
    NotifierChannel.Wallet,
    NotifierWalletEvent.OrderbookOrderUpdated,
    handleOrderbookOrderUpdated
  );

  return <PortfolioOpenOrdersTab tokenAddress={asset.address} />;
}
