import { useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { MavrykToolkit } from "@mavrykdynamics/taquito";
import { basenetNetRpcnode } from "~/consts/rpcNodes";
import { rwaApi } from "~/lib/apis/rwa/client";
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

const launchCardsSchema = z.object({
  address: z.string(),
  launches: z.array(
    z.object({
      name: z.string().min(1),
      status: z.enum(["active", "inactive", "paused", "closed"]),
    })
  ),
});

export function usePrimaryPurchase(assetAddress: string) {
  const { userAddress } = useUserContext();
  const { dapp } = useWalletContext();
  const tezos = useMemo(
    () => dapp?.tezos() ?? new MavrykToolkit(basenetNetRpcnode),
    [dapp]
  );
  const queryClient = useQueryClient();
  const invalidateFreshQueries = useFreshQueryInvalidation();
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
        const response = await rwaApi.get(
          `/assets/${encodeURIComponent(assetAddress)}/launch`
        );
        const cards = launchCardsSchema.parse(response.data);
        if (cards.address !== assetAddress)
          throw new Error("The launch response does not match this asset.");
        // The endpoint is active-first/newest-first. Names and options are data.
        const card =
          cards.launches.find((item) => item.status === "active") ??
          cards.launches[0];
        if (!card)
          throw new Error("No primary sale is available for this asset.");
        return await readPrimaryPurchaseConfig({
          tezos,
          assetAddress,
          launchName: card.name,
          wallet: userAddress,
        });
      } catch (error) {
        throw primaryPurchaseError(error);
      }
    },
    retry: false,
    refetchInterval: 10_000,
  });
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
  return { ...query, tezos, refreshAfterPurchase };
}
