import { useCallback, useEffect, useRef, useState } from "react";
import { useApolloClient } from "@apollo/client/index";
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
import {
  assertRefundPartClaimable,
  collectAssetRefunds,
} from "~/lib/apis/rwa/refunds/refunds";
import type { RefundPart } from "~/lib/apis/rwa/refunds/refunds.types";
import type { OrderPlan, OrderPlanRequest } from "~/lib/relay/orderPlan";
import {
  getPermitActionErrorMessage,
  startPermitAction,
} from "~/lib/relay/permitAction";
import { useAuthContext } from "~/providers/AuthProvider/auth.provider";
import { useGasPayment } from "~/providers/GasPaymentProvider/GasPaymentProvider";
import { useRelay } from "~/providers/RelayProvider/RelayProvider";
import { useToasterContext } from "~/providers/ToasterProvider/toaster.provider";
import { getIsKycedForAddress } from "~/providers/UserProvider/helpers/userStatus.helpers";
import { USER_ACCOUNT_STATUS_QUERY } from "~/providers/UserProvider/queries/user.query";
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
  const user = useUserContext();
  const { userAddress } = user;
  const auth = useAuthContext();
  const payment = useGasPayment();
  const relay = useRelay();
  const apollo = useApolloClient();
  const { success, bug } = useToasterContext();
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<RefundAllProgress | null>(null);
  const onRunEndRef = useRef(onRunEnd);
  onRunEndRef.current = onRunEnd;
  const relayRef = useRef(relay);
  relayRef.current = relay;
  const userAddressRef = useRef(userAddress);
  userAddressRef.current = userAddress;
  const planRef = useRef<OrderPlan | null>(null);
  const isRunningRef = useRef(false);

  // Relay rows arrive through the provider; the active part settles on them.
  useEffect(() => {
    planRef.current?.reconcile();
  }, [relay.records]);

  useEffect(() => () => planRef.current?.stop(), []);

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
          getPermitActionErrorMessage(error) ||
            unknownToError(error)?.message ||
            "An error occurred while processing refund"
        );
      }

      if (completedParts > 0) refreshAfterRefund();
      onRunEndRef.current?.(isCompleted);
    },
    [bug, refreshAfterRefund, success]
  );

  /** Fresh KYC and refund eligibility before each Credits signature. */
  const validateCreditsPart = useCallback(
    async (runtime: PermitRuntime, request: OrderPlanRequest) => {
      if (request.kind !== "process_refund")
        throw new Error("Unsupported refund action");

      const scope = JSON.stringify(runtime.getScope());
      const wallet = runtime.getScope().wallet;
      const { data } = await apollo.query({
        query: USER_ACCOUNT_STATUS_QUERY,
        variables: { address: wallet },
        fetchPolicy: "network-only",
      });

      if (JSON.stringify(runtime.getScope()) !== scope)
        throw new Error("Wallet changed. Refund was stopped.");
      if (!getIsKycedForAddress(data, wallet))
        throw new Error("Verify with Mavryk Pro before claiming refunds.");

      await assertRefundPartClaimable({
        walletAddress: wallet,
        tokenAddress,
        part: {
          orderbookAddress: request.orderbookAddress,
          orders: request.orders,
        },
      });
    },
    [apollo, tokenAddress]
  );

  const mvrkReason = feeQuery.isError
    ? "Unable to verify MVRK balance or network fee. Retry the estimate."
    : !fee
      ? "Waiting for a verified MVRK balance and network fee."
      : fee.balance.lt(fee.totalDebit)
        ? "Insufficient MVRK for network fees and storage costs."
        : undefined;

  const needsSignIn = isCredits && payment.needsSignIn;

  const creditsReason = needsSignIn
    ? "Sign in to pay with Gas Credits."
    : !user.isKyced
      ? "Verify with Mavryk Pro before claiming refunds."
      : !relay.isReady
        ? (relay.error ?? "Connecting to Gas Credits. Please wait.")
        : creditsQuery.isError
          ? "Unable to check Credits availability. Retry."
          : !creditsInfo
            ? "Checking Credits availability."
            : creditsInfo.unsupportedParts > 0
              ? `${creditsInfo.unsupportedParts} of ${scan?.parts.length ?? 0} refund transactions can't be paid with Credits. Choose MVRK in Profile payment settings.`
              : undefined;

  const reason = !payment.isRestored
    ? "Waiting for wallet, network and payment preference."
    : isCredits
      ? creditsReason
      : mvrkReason;

  const runDirectPart = async (
    part: RefundPart,
    tezos: MavrykToolkit,
    runWallet: string,
    runChainId: string | undefined
  ) => {
    await orderbookProcessRefunds({
      tezos,
      // Each part is re-estimated and balance-checked by sendDirectOrder.
      beforeSubmit: async () => {
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
      },
      orderbookContractAddress: part.orderbookAddress,
      orders: part.orders,
    });
  };

  const runCreditsPart = async (part: RefundPart) => {
    const current = relayRef.current;
    const runtime = current.runtime;

    if (!runtime || !current.isReady)
      throw new Error("Gas Credits are unavailable. Sign in and try again.");

    const { plan, done } = startPermitAction(toRefundRequest(part), {
      runtime,
      validate: (request) => validateCreditsPart(runtime, request),
      isLocked: (contract) => relayRef.current.isLocked(contract),
      records: () =>
        relayRef.current.lifecycle?.records ?? relayRef.current.records,
      submit: (signed, onAttempt) => relayRef.current.submit(signed, onAttempt),
    });

    planRef.current = plan;

    try {
      await done;
    } finally {
      planRef.current = null;
    }
  };

  /** One loop for both payment paths: one signature and one call per part. */
  const runRefundAll = async () => {
    if (!scan) return;

    // The payment path is locked for the whole run.
    const isCreditsRun = isCredits;
    const tezos = payment.toolkit;
    const runWallet = userAddress;
    const runChainId = payment.chainId;

    if (!isCreditsRun && (!tezos || !runWallet)) return;

    isRunningRef.current = true;
    const { parts } = scan;
    let completedParts = 0;
    let runError: unknown;

    try {
      for (const [index, part] of parts.entries()) {
        setProgress({ current: index + 1, total: parts.length });

        if (isCreditsRun) {
          await runCreditsPart(part);
        } else {
          await runDirectPart(part, tezos!, runWallet!, runChainId);
        }

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
    if (!scan || reason || isRunningRef.current) return;

    void runRefundAll();
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
    needsSignIn,
    signIn: () => void auth.login().catch(() => undefined),
    reason,
    refundAll,
    progress,
    isRefunding: progress !== null,
  };
}
