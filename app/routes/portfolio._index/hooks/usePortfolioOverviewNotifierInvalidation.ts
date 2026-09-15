import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

import {
  NotifierChannel,
  NotifierWalletEvent,
} from "~/providers/NotificationsProvider/notifications.const";
import { useNotifierEvent } from "~/providers/NotificationsProvider/hooks/useNotifierEvent";

export const usePortfolioOverviewNotifierInvalidation = () => {
  const queryClient = useQueryClient();

  const invalidatePortfolioQueries = useCallback(() => {
    void Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["rwa-wallet"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["rwa-wallet-portfolio"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["rwa-wallet-portfolio-history"],
      }),
    ]);
  }, [queryClient]);

  useNotifierEvent(
    NotifierChannel.Wallet,
    NotifierWalletEvent.OrderbookOrderUpdated,
    invalidatePortfolioQueries
  );

  useNotifierEvent(
    NotifierChannel.Wallet,
    NotifierWalletEvent.TokenLedgerTransfer,
    invalidatePortfolioQueries
  );
};
