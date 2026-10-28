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
import type { PermitRuntime } from "~/contracts/permit";
import { checkWhetherWalletAbortError, unknownToError } from "~/errors/error";
import { useOrderbookExecution } from "~/hooks/useOrderbookExecution";
import {
  assertRefundPartClaimable,
  collectAssetRefunds,
} from "~/lib/apis/rwa/refunds/refunds";
import type { RefundPart } from "~/lib/apis/rwa/refunds/refunds.types";
import type { OrderPlanRequest } from "~/lib/relay/orderPlan";
import { useGasPayment } from "~/providers/GasPaymentProvider/GasPaymentProvider";
import { useRelay } from "~/providers/RelayProvider/RelayProvider";
import { useToasterContext } from "~/providers/ToasterProvider/toaster.provider";
import { useUserContext } from "~/providers/UserProvider/user.provider";

type UseRefundAllAssetOrdersOptions = {
  tokenAddress: string;
  enabled: boolean;
  /** Called once per run, after the last part settles or the run stops. */
  onRunEnd?: (isCompleted: boolean) => void;
};

export type RefundAllProgress = {
  current: number;
  total: number;
};

/** Credits preview: per-part service fee from the resolved relay schedule. */
export type RefundAllCreditsInfo = {
  unsupportedParts: number;
  feeUnits: bigint;
  feeDecimals: number | null;
};

type CreditsRun = {
  parts: RefundPart[];
  index: number;
  completed: number;
  pendingStart: boolean;
};

const PROCESS_REFUND_VARIANT = "permitProcessRefund";

const portfolioQueryPrefixes = [
  "rwa-wallet",
  "rwa-wallet-portfolio",
  "rwa-wallet-portfolio-history",
];

const toRefundRequest = (part: RefundPart | undefined): OrderPlanRequest => ({
  kind: "process_refund",
  orderbookAddress: part?.orderbookAddress ?? "",
  orders: part?.orders ?? [],
});

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

const fetchRefundAllCreditsInfo = async (
  runtime: PermitRuntime,
  parts: RefundPart[]
): Promise<RefundAllCreditsInfo> => {
  const config = await runtime.refreshConfig();
  // Historical discoverability does not imply relay eligibility: check each book.
  const unsupportedParts = parts.filter(
    ({ orderbookAddress }) =>
      !config.enabled ||
      !config.contracts.some(
        (contract) =>
          contract.address === orderbookAddress &&
          contract.kind === "orderbook" &&
          contract.permitActions.includes(PROCESS_REFUND_VARIANT)
      )
  ).length;
  const fee = config.fee;

  return {
    unsupportedParts,
    // An absent variant is free; the fee is charged per part, not per order.
    feeUnits: fee.enabled
      ? BigInt(fee.feeSchedule[PROCESS_REFUND_VARIANT] ?? "0") *
        BigInt(parts.length)
      : 0n,
    feeDecimals: fee.enabled ? fee.decimals : null,
  };
};

export function useRefundAllAssetOrders({
  tokenAddress,
  enabled,
  onRunEnd,
}: UseRefundAllAssetOrdersOptions) {
  const { userAddress } = useUserContext();
  const payment = useGasPayment();
  const relay = useRelay();
  const { success, bug } = useToasterContext();
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<RefundAllProgress | null>(null);
  const [creditsRun, setCreditsRun] = useState<CreditsRun | null>(null);
  const creditsRunRef = useRef(creditsRun);
  creditsRunRef.current = creditsRun;
  const onRunEndRef = useRef(onRunEnd);
  onRunEndRef.current = onRunEnd;
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
  const hasParts = Boolean(scan?.isRealtime && scan.parts.length > 0);
  const isCredits = payment.isRestored && payment.method === "credits";
  const isMvrk = payment.isRestored && payment.method === "mvrk";

  const canEstimate = Boolean(
    enabled &&
      isMvrk &&
      hasParts &&
      payment.toolkit &&
      payment.wallet &&
      payment.wallet === userAddress
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

  const canCheckCredits = Boolean(
    enabled && isCredits && hasParts && relay.runtime
  );

  const creditsQuery = useQuery({
    queryKey: [
      "rwa-refund-all-credits",
      relay.runtime ? JSON.stringify(relay.runtime.getScope()) : null,
      tokenAddress,
      scan?.parts,
    ],
    queryFn: () => fetchRefundAllCreditsInfo(relay.runtime!, scan!.parts),
    enabled: canCheckCredits,
    gcTime: 0,
    staleTime: 0,
    retry: false,
  });

  const fee = canEstimate ? feeQuery.data : undefined;
  const creditsInfo = canCheckCredits ? creditsQuery.data : undefined;

  const refreshAfterRefund = useCallback(() => {
    void Promise.all(
      portfolioQueryPrefixes.map((prefix) =>
        queryClient.invalidateQueries({ queryKey: [prefix] })
      )
    );
  }, [queryClient]);

  const finishRun = useCallback(
    (completedParts: number, totalParts: number, error?: unknown) => {
      const isCompleted = completedParts === totalParts;

      if (isCompleted) {
        success(
          "Refund completed successfully",
          "Your refund has been processed. The funds have been returned to your wallet."
        );
      } else if (completedParts > 0) {
        bug(
          "Some transactions couldn’t be completed. Successfully processed refunds remain completed.",
          "Some refunds failed"
        );
      } else if (error && !checkWhetherWalletAbortError(error)) {
        bug(
          unknownToError(error)?.message ||
            "An error occurred while processing refund"
        );
      }

      if (completedParts > 0) refreshAfterRefund();
      onRunEndRef.current?.(isCompleted);
    },
    [bug, refreshAfterRefund, success]
  );

  const validateRefundPart = useCallback(
    async (runtime: PermitRuntime, request: OrderPlanRequest) => {
      if (request.kind !== "process_refund")
        throw new Error("Unsupported refund action");

      await assertRefundPartClaimable({
        walletAddress: runtime.getScope().wallet,
        tokenAddress,
        part: {
          orderbookAddress: request.orderbookAddress,
          orders: request.orders,
        },
      });
    },
    [tokenAddress]
  );

  const execution = useOrderbookExecution({
    request: toRefundRequest(
      creditsRun?.parts[creditsRun.index] ?? scan?.parts[0]
    ),
    // Direct runs never go through this hook; see runDirect.
    invokeDirect: async () => undefined,
    validateRequest: validateRefundPart,
    onConfirmed: () => {
      const run = creditsRunRef.current;
      if (!run) return;

      const completed = run.completed + 1;

      if (completed === run.parts.length) {
        setCreditsRun(null);
        finishRun(completed, run.parts.length);
        return;
      }

      // The next part needs its own review and wallet signature.
      setCreditsRun({
        ...run,
        index: run.index + 1,
        completed,
        pendingStart: true,
      });
    },
  });

  // Starts the pending part once its request is rendered into the execution.
  useEffect(() => {
    if (!creditsRun?.pendingStart) return;

    if (payment.method !== "credits") {
      setCreditsRun(null);
      finishRun(
        creditsRun.completed,
        creditsRun.parts.length,
        new Error("Payment method changed. Refund was stopped.")
      );
      return;
    }

    void execution.execute();
    setCreditsRun({ ...creditsRun, pendingStart: false });
  }, [creditsRun, execution, finishRun, payment.method]);

  // Closing the plan (or a start that never began) ends the run.
  useEffect(() => {
    if (!creditsRun || creditsRun.pendingStart || execution.state !== null)
      return;

    setCreditsRun(null);
    finishRun(creditsRun.completed, creditsRun.parts.length);
  }, [creditsRun, execution.state, finishRun]);

  const mvrkReason = feeQuery.isError
    ? "Unable to verify MVRK balance or network fee. Retry the estimate."
    : !fee
      ? "Waiting for a verified MVRK balance and network fee."
      : fee.balance.lt(fee.totalDebit)
        ? "Insufficient MVRK for network fees and storage costs."
        : undefined;

  const creditsReason =
    execution.reason ??
    (creditsQuery.isError
      ? "Unable to check Credits availability. Retry."
      : !creditsInfo
        ? "Checking Credits availability."
        : creditsInfo.unsupportedParts > 0
          ? `${creditsInfo.unsupportedParts} of ${scan?.parts.length ?? 0} refund transactions can't be paid with Credits. Choose MVRK in Profile payment settings.`
          : undefined);

  const reason = !payment.isRestored
    ? "Waiting for wallet, network and payment preference."
    : isCredits
      ? creditsReason
      : mvrkReason;

  const runDirect = async () => {
    const tezos = payment.toolkit;
    const runWallet = userAddress;
    const runChainId = payment.chainId;

    if (!scan || !tezos || !runWallet) return;

    isRunningRef.current = true;
    const { parts } = scan;
    let completedParts = 0;
    let runError: unknown;

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
    } catch (error) {
      runError = error;
    } finally {
      isRunningRef.current = false;
      setProgress(null);
      finishRun(completedParts, parts.length, runError);
    }
  };

  const refundAll = () => {
    if (!scan || reason || isRunningRef.current || creditsRunRef.current)
      return;

    if (isCredits) {
      // Payment path is locked for the run; one part is signed at a time.
      setCreditsRun({
        parts: scan.parts,
        index: 0,
        completed: 0,
        pendingStart: true,
      });
      return;
    }

    void runDirect();
  };

  const canRetry = isCredits
    ? canCheckCredits && creditsQuery.isError
    : canEstimate && feeQuery.isError;

  return {
    scan,
    isScanning: scanQuery.isFetching,
    scanError: scanQuery.error,
    rescan: scanQuery.refetch,
    paymentMethod: payment.isRestored ? payment.method : null,
    fee,
    creditsInfo,
    isPreparing:
      (canEstimate && feeQuery.isFetching) ||
      (canCheckCredits && creditsQuery.isFetching),
    canRetry,
    retry: () => void (isCredits ? creditsQuery.refetch() : feeQuery.refetch()),
    reason,
    refundAll,
    progress,
    isRefunding: progress !== null,
    isCreditsRunning: creditsRun !== null,
    executionControls: execution.controls,
  };
}
