import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { MavrykToolkit } from "@mavrykdynamics/taquito";
import { BigNumber } from "bignumber.js";

import {
  estimateDirectOrderFee,
  type DirectOrderFee,
} from "~/contracts/directOrderFee";
import {
  orderbookProcessRefunds,
  orderbookRefundsBatch,
} from "~/contracts/orderbook.contract";
import { checkWhetherWalletAbortError, unknownToError } from "~/errors/error";
import { collectAssetRefunds } from "~/lib/apis/rwa/refunds/refunds";
import type { RefundPart } from "~/lib/apis/rwa/refunds/refunds.types";
import { useGasPayment } from "~/providers/GasPaymentProvider/GasPaymentProvider";
import { useToasterContext } from "~/providers/ToasterProvider/toaster.provider";
import { useUserContext } from "~/providers/UserProvider/user.provider";

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

const estimateRefundAllFee = async (
  tezos: MavrykToolkit,
  wallet: string,
  parts: RefundPart[]
): Promise<DirectOrderFee> => {
  let networkFee = new BigNumber(0);
  let storageCost = new BigNumber(0);
  let balance = new BigNumber(0);

  // One estimate per orderbook call, exactly as it will be sent; fees are summed.
  for (const part of parts) {
    const batch = await orderbookRefundsBatch({
      tezos,
      orderbookContractAddress: part.orderbookAddress,
      orders: part.orders,
    });
    const fee = await estimateDirectOrderFee(tezos, batch, wallet);

    networkFee = networkFee.plus(fee.networkFee);
    storageCost = storageCost.plus(fee.storageCost);
    balance = fee.balance;
  }

  return {
    networkFee,
    storageCost,
    totalDebit: networkFee.plus(storageCost),
    balance,
  };
};

export function useRefundAllAssetOrders({
  tokenAddress,
  enabled,
}: UseRefundAllAssetOrdersOptions) {
  const { userAddress } = useUserContext();
  const payment = useGasPayment();
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

  const scan = scanQuery.data;
  const isMvrk = payment.isRestored && payment.method === "mvrk";
  const canEstimate = Boolean(
    enabled &&
      isMvrk &&
      payment.toolkit &&
      payment.wallet &&
      payment.wallet === userAddress &&
      scan?.isRealtime &&
      scan.parts.length > 0
  );

  const feeQuery = useQuery({
    queryKey: [
      "rwa-refund-all-fee",
      payment.wallet,
      payment.chainId,
      tokenAddress,
      scan?.parts,
    ],
    queryFn: () =>
      estimateRefundAllFee(payment.toolkit!, payment.wallet!, scan!.parts),
    enabled: canEstimate,
    gcTime: 0,
    staleTime: 0,
    retry: false,
  });

  const fee = canEstimate ? feeQuery.data : undefined;

  const reason = !payment.isRestored
    ? "Waiting for wallet, network and payment preference."
    : payment.method === "credits"
      ? "Claiming all refunds with Credits is not available yet. Choose MVRK in Profile payment settings."
      : feeQuery.isError
        ? "Unable to verify MVRK balance or network fee. Retry the estimate."
        : !fee
          ? "Waiting for a verified MVRK balance and network fee."
          : fee.balance.lt(fee.totalDebit)
            ? "Insufficient MVRK for network fees and storage costs."
            : undefined;

  const refreshAfterRefund = useCallback(() => {
    void Promise.all(
      portfolioQueryPrefixes.map((prefix) =>
        queryClient.invalidateQueries({ queryKey: [prefix] })
      )
    );
  }, [queryClient]);

  /** Resolves to true when every part was confirmed. */
  const refundAll = useCallback(async () => {
    const tezos = payment.toolkit;
    const runWallet = userAddress;
    const runChainId = payment.chainId;

    if (!scan || !tezos || !runWallet || reason || isRunningRef.current)
      return false;

    isRunningRef.current = true;
    const { parts } = scan;
    let completedParts = 0;

    // Each part is re-estimated and balance-checked by sendDirectOrder.
    const beforeSubmit = async () => {
      const [wallet, chain] = await Promise.all([
        tezos.wallet.pkh(),
        tezos.rpc.getChainId(),
      ]);

      if (
        wallet !== runWallet ||
        userAddressRef.current !== runWallet ||
        chain !== runChainId
      ) {
        throw new Error("Wallet or network changed. Refund was stopped.");
      }
    };

    try {
      for (const [index, part] of parts.entries()) {
        setProgress({ current: index + 1, total: parts.length });

        await orderbookProcessRefunds({
          tezos,
          beforeSubmit,
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
    payment.chainId,
    payment.toolkit,
    reason,
    refreshAfterRefund,
    scan,
    success,
    userAddress,
  ]);

  return {
    scan,
    isScanning: scanQuery.isFetching,
    scanError: scanQuery.error,
    rescan: scanQuery.refetch,
    fee,
    isEstimatingFee: canEstimate && feeQuery.isFetching,
    canRetryFee: canEstimate && feeQuery.isError,
    retryFee: feeQuery.refetch,
    reason,
    refundAll,
    progress,
    isRefunding: progress !== null,
  };
}
