import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { orderbookProcessRefunds } from "~/contracts/orderbook.contract";
import { checkWhetherWalletAbortError, unknownToError } from "~/errors/error";
import { collectAssetRefunds } from "~/lib/apis/rwa/refunds/refunds";
import { useToasterContext } from "~/providers/ToasterProvider/toaster.provider";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { useWalletContext } from "~/providers/WalletProvider/wallet.provider";

type UseRefundAllAssetOrdersOptions = {
  tokenAddress: string;
  enabled: boolean;
};

export type RefundAllProgress = {
  current: number;
  total: number;
};

const portfolioQueryPrefixes = [
  "rwa-wallet",
  "rwa-wallet-portfolio",
  "rwa-wallet-portfolio-history",
];

export function useRefundAllAssetOrders({
  tokenAddress,
  enabled,
}: UseRefundAllAssetOrdersOptions) {
  const { userAddress } = useUserContext();
  const { dapp } = useWalletContext();
  const { success, bug } = useToasterContext();
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<RefundAllProgress | null>(null);
  const userAddressRef = useRef(userAddress);
  const isRunningRef = useRef(false);

  useEffect(() => {
    userAddressRef.current = userAddress;
  }, [userAddress]);

  const scanQuery = useQuery({
    queryKey: ["rwa-wallet-refunds", userAddress, tokenAddress],
    queryFn: ({ signal }) =>
      collectAssetRefunds({
        walletAddress: userAddress || "",
        tokenAddress,
        signal,
      }),
    enabled: enabled && Boolean(userAddress),
    gcTime: 0,
    staleTime: 0,
    retry: false,
  });

  const refreshAfterRefund = useCallback(() => {
    void Promise.all(
      portfolioQueryPrefixes.map((prefix) =>
        queryClient.invalidateQueries({ queryKey: [prefix] })
      )
    );
  }, [queryClient]);

  /** Resolves to true when every part was confirmed. */
  const refundAll = useCallback(async () => {
    const scan = scanQuery.data;
    const tezos = dapp?.tezos();
    const runWallet = userAddress;

    if (!scan || !tezos || !runWallet || isRunningRef.current) return false;

    isRunningRef.current = true;
    const { parts } = scan;
    let completedParts = 0;

    try {
      for (const [index, part] of parts.entries()) {
        if (userAddressRef.current !== runWallet) {
          throw new Error("Wallet changed. Refund was stopped.");
        }

        setProgress({ current: index + 1, total: parts.length });

        await orderbookProcessRefunds({
          tezos,
          orderbookContractAddress: part.orderbookAddress,
          orders: part.orders,
        });

        completedParts += 1;
      }

      success(
        "Refund Confirmed",
        "Your refund transactions were confirmed. Funds will appear in your wallet shortly."
      );

      return true;
    } catch (error) {
      const isAborted = checkWhetherWalletAbortError(error);

      if (completedParts > 0) {
        bug(
          `${completedParts} of ${parts.length} refund transactions were confirmed. The rest were not completed, please try again.`
        );
      } else if (!isAborted) {
        bug(
          unknownToError(error)?.message ||
            "An error occurred while processing refund"
        );
      }

      return false;
    } finally {
      isRunningRef.current = false;
      setProgress(null);

      if (completedParts > 0) {
        refreshAfterRefund();
      }
    }
  }, [
    bug,
    dapp,
    refreshAfterRefund,
    scanQuery.data,
    success,
    userAddress,
  ]);

  return {
    scan: scanQuery.data,
    isScanning: scanQuery.isFetching,
    scanError: scanQuery.error,
    rescan: scanQuery.refetch,
    refundAll,
    progress,
    isRefunding: progress !== null,
  };
}
