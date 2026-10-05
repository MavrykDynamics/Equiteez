import { useCallback } from "react";

import {
  FreshnessSource,
  useFreshQueryInvalidation,
} from "~/lib/apis/rwa/freshness";
import {
  NotifierChannel,
  NotifierWalletEvent,
} from "~/providers/NotificationsProvider/notifications.const";
import { useNotifierEvent } from "~/providers/NotificationsProvider/hooks/useNotifierEvent";

export const usePortfolioActivityNotifierInvalidation = () => {
  const invalidateFreshQueries = useFreshQueryInvalidation();

  const handleOrderbookOrderUpdated = useCallback(() => {
    void Promise.all([
      invalidateFreshQueries("fetchWalletActivitySummary", {
        source: FreshnessSource.Orderbook,
      }),
      invalidateFreshQueries("fetchWalletOpenOrders", {
        source: FreshnessSource.Orderbook,
      }),
      invalidateFreshQueries("fetchWalletOrderHistory", {
        source: FreshnessSource.Orderbook,
      }),
    ]);
  }, [invalidateFreshQueries]);

  const handleTokenLedgerTransfer = useCallback(() => {
    void Promise.all([
      invalidateFreshQueries("fetchWalletActivitySummary", {
        source: FreshnessSource.Chain,
      }),
      invalidateFreshQueries("fetchWalletTransferHistory", {
        source: FreshnessSource.Chain,
      }),
    ]);
  }, [invalidateFreshQueries]);

  useNotifierEvent(
    NotifierChannel.Wallet,
    NotifierWalletEvent.OrderbookOrderUpdated,
    handleOrderbookOrderUpdated
  );

  useNotifierEvent(
    NotifierChannel.Wallet,
    NotifierWalletEvent.TokenLedgerTransfer,
    handleTokenLedgerTransfer
  );
};
