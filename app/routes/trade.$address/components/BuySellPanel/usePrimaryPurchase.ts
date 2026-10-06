import { PRIMARY_HISTORY_QUERY_KEY } from "~/lib/apis/primaryPurchases/primaryPurchases";
import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MavrykToolkit } from "@mavrykdynamics/taquito";
import { basenetNetRpcnode } from "~/consts/rpcNodes";
import { assetLaunchQueryOptions } from "../../hooks/assetLaunch";
import { readPrimaryPurchaseConfig } from "~/contracts/primaryPurchase.read";
import { primaryPurchaseError } from "~/contracts/primaryPurchase.errors";
import {
  FreshnessSource,
  useFreshQueryInvalidation,
} from "~/lib/apis/rwa/freshness";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { useWalletContext } from "~/providers/WalletProvider/wallet.provider";
import { useNotifierEvent } from "~/providers/NotificationsProvider/hooks/useNotifierEvent";
import {
  NotifierChannel,
  NotifierWalletEvent,
} from "~/providers/NotificationsProvider/notifications.const";
import type { ContractActionSuccessMetadata } from "~/contracts/actions.type";

export function usePrimaryPurchaseConfig(assetAddress: string) {
  const { userAddress } = useUserContext();
  const { dapp } = useWalletContext();
  const tezos = useMemo(
    () => dapp?.tezos() ?? new MavrykToolkit(basenetNetRpcnode),
    [dapp]
  );
  const queryClient = useQueryClient();
  const queryKey = useMemo(
    () => [
      "primary-purchase",
      tezos.rpc.getRpcUrl(),
      assetAddress,
      userAddress,
    ],
    [assetAddress, tezos, userAddress]
  );
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        const card = await queryClient.fetchQuery(
          assetLaunchQueryOptions(assetAddress)
        );
        const config = await readPrimaryPurchaseConfig({
          tezos,
          assetAddress,
          launchName: card.name,
          wallet: userAddress,
        });
        return {
          ...config,
          countdown: { saleStart: card.sale_start, saleEnd: card.sale_end },
        };
      } catch (error) {
        throw primaryPurchaseError(error);
      }
    },
    retry: false,
    // Form entry and explicit review own chain reads; display polling belongs
    // to the launch-card query, not wallet-specific contract validation.
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  return { ...query, tezos, queryKey };
}

export function usePrimaryPurchase(assetAddress: string) {
  const query = usePrimaryPurchaseConfig(assetAddress);
  const { queryKey } = query;
  const { userAddress } = useUserContext();
  const queryClient = useQueryClient();
  const invalidateFreshQueries = useFreshQueryInvalidation();
  const refreshAfterPurchase = useCallback(
    (metadata?: ContractActionSuccessMetadata) => {
      const mark = {
        source: FreshnessSource.Chain,
        level: metadata?.confirmation?.level,
      };
      void Promise.all([
        invalidateFreshQueries("fetchWalletTransferHistory", mark),
        invalidateFreshQueries("fetchWalletActivitySummary", mark),
        queryClient.invalidateQueries({ queryKey }),
        queryClient.invalidateQueries({
          queryKey: [PRIMARY_HISTORY_QUERY_KEY],
        }),
      ]);
      // This wallet-scoped refresh must survive navigation after confirmation.
      // The portfolio endpoint has a 20s TTL and no fresh=1 override.
      window.setTimeout(() => {
        void queryClient.invalidateQueries({
          queryKey: ["rwa-wallet-portfolio", userAddress],
        });
      }, 20_100);
    },
    [invalidateFreshQueries, queryClient, queryKey, userAddress]
  );
  const handlePurchaseEvent = useCallback(
    (_frame: unknown, wallet: string) => {
      if (wallet === userAddress) refreshAfterPurchase();
    },
    [refreshAfterPurchase, userAddress]
  );
  useNotifierEvent(
    NotifierChannel.Wallet,
    NotifierWalletEvent.LaunchpadPurchase,
    handlePurchaseEvent
  );
  return { ...query, refreshAfterPurchase };
}
