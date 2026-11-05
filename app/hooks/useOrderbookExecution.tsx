import { useEffect, useRef, useState } from "react";
import { useApolloClient } from "@apollo/client/index";
import { useQuery } from "@tanstack/react-query";
import { relayConfigQueryOptions } from "~/lib/apis/rwa/relay/relay";
import { useGasPayment } from "~/providers/GasPaymentProvider/GasPaymentProvider";
import { useRelay } from "~/providers/RelayProvider/RelayProvider";
import { useToasterContext } from "~/providers/ToasterProvider/toaster.provider";
import { useUserContext } from "~/providers/UserProvider/user.provider";
import { USER_ACCOUNT_STATUS_QUERY } from "~/providers/UserProvider/queries/user.query";
import { getIsKycedForAddress } from "~/providers/UserProvider/helpers/userStatus.helpers";
import { validateOrderPlan } from "~/contracts/orderPlanValidation";
import { checkWhetherWalletAbortError, unknownToError } from "~/errors/error";
import {
  isRelayOutcomeError,
  type OrderPlan,
  type OrderPlanRequest,
} from "~/lib/relay/orderPlan";
import { getRelayEligibility } from "~/lib/relay/relay.eligibility";
import {
  getRelayFailureNotice,
  getRelayNoticeForCode,
  type RelayFailureNotice,
} from "~/lib/relay/relayFailure";
import {
  getPermitActionErrorMessage,
  startPermitAction,
  type PermitActionStep,
} from "~/lib/relay/permitAction";
import {
  STATUS_CONFIRMING,
  STATUS_IDLE,
  STATUS_PENDING,
  type StatusFlag,
} from "~/lib/ui/use-status-flag";

type Options = {
  request: OrderPlanRequest;
  validationMessage?: string;
  directReason?: string;
  invokeDirect: () => Promise<void>;
  onConfirmed: () => void;
  /** The caller renders `notice` itself instead of a toast for relay failures. */
  inlineNotice?: boolean;
  /** Shown while a signed permit is relayed, like a direct wallet operation. */
  pendingToast?: { title: string; message: string };
};

const PENDING_AVAILABILITY = "Checking Gas Station availability.";

function getRequestContracts(request: OrderPlanRequest) {
  if (!("book" in request))
    return { orderbookAddress: request.orderbookAddress };
  return {
    orderbookAddress: request.book.address,
    tokenAddress:
      request.kind === "place_buy_order"
        ? request.book.quoteTokenAddress
        : request.book.baseTokenAddress,
  };
}
/**
 * Mode routing only: direct success stays in useContractAction; relay success
 * requires a confirmed row. Both paths go straight from the caller's confirm
 * click to the wallet prompt, with no plan dialogs.
 */
export function useOrderbookExecution(options: Options) {
  const payment = useGasPayment();
  const relay = useRelay();
  const user = useUserContext();
  const apollo = useApolloClient();
  const { bug, loading, hideToasterMessage } = useToasterContext();
  const [step, setStep] = useState<PermitActionStep | null>(null);
  const [failure, setFailure] = useState<
    (RelayFailureNotice & { at: number }) | null
  >(null);
  const isCredits = payment.isRestored && payment.method === "credits";
  // Same cache entry as the Credits badge; signing still refreshes it.
  const config = useQuery({
    ...relayConfigQueryOptions(payment.scope ?? "unresolved"),
    enabled: Boolean(isCredits && payment.scope),
    refetchInterval: 60_000,
  });
  const isBusy = step !== null;
  const plan = useRef<OrderPlan | null>(null);
  const mounted = useRef(true);
  const current = useRef({ options, relay });
  current.current = { options, relay };
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      plan.current?.stop();
    };
  }, []);
  // Relay rows arrive through the provider; the active action settles on them.
  useEffect(() => {
    plan.current?.reconcile();
  }, [relay.records]);
  const requestKey = JSON.stringify(options.request);
  // A notice belongs to the reviewed order and payment method; a mismatch
  // notice explains the method change itself, so it survives that reread.
  useEffect(() => {
    setFailure(null);
  }, [requestKey]);
  useEffect(() => {
    setFailure((previous) =>
      previous?.kind === "payment-mismatch" ? previous : null
    );
  }, [payment.method]);
  // A confirmed top-up after a shortage resolves it.
  useEffect(() => {
    if (failure?.kind !== "credit-shortage") return;
    if (
      relay.records.some(
        ({ row }) =>
          row?.intentKind === "fee_top_up" &&
          row.status === "confirmed" &&
          Date.parse(row.updatedAt ?? "") > failure.at
      )
    )
      setFailure(null);
  }, [failure, relay.records]);
  const eligibility = isCredits
    ? getRelayEligibility({
        config: config.data ?? { state: "loading" },
        // Sign-in is gated by relay.isReady below.
        wallet: payment.wallet,
        authenticatedWallet: payment.wallet,
        isAuthLoading: false,
        action: options.request.kind,
        ...getRequestContracts(options.request),
      })
    : null;
  const availability =
    !eligibility || eligibility.eligible
      ? null
      : eligibility.reason === "unsupported-contract"
        ? getRelayNoticeForCode("CONTRACT_NOT_RELAYABLE")
        : eligibility.reason === "relay-disabled"
          ? getRelayNoticeForCode(
              config.data?.state === "ready"
                ? "RELAY_DISABLED"
                : "RELAY_UNAVAILABLE"
            )
          : null;
  const isAvailabilityPending =
    eligibility !== null && !eligibility.eligible && !availability;
  const reason =
    options.validationMessage ??
    (!payment.isRestored
      ? "Waiting for wallet and saved payment settings."
      : payment.method === "mvrk"
        ? options.directReason
        : !user.isKyced
          ? "Verify with Mavryk Pro before trading."
          : !relay.isReady
            ? (relay.error ??
              "Connect and sign in; waiting for relay recovery.")
            : isAvailabilityPending
              ? PENDING_AVAILABILITY
              : availability?.message);
  const execute = async () => {
    if (isBusy || reason) return;
    if (payment.method === "mvrk") {
      await options.invokeDirect();
      return;
    }
    const runtime = relay.runtime;
    if (!runtime) return;
    const originalKey = JSON.stringify(options.request);
    const assertForm = () => {
      if (JSON.stringify(current.current.options.request) !== originalKey)
        throw new Error(
          "The order or price changed. Review the updated order."
        );
      if (current.current.options.validationMessage)
        throw new Error(current.current.options.validationMessage);
    };
    setFailure(null);
    setStep("preparing");
    let pendingToastId: string | undefined;
    const hidePendingToast = () => {
      if (pendingToastId) hideToasterMessage(pendingToastId);
      pendingToastId = undefined;
    };
    try {
      const { plan: next, done } = startPermitAction(
        options.request,
        {
          runtime,
          isLocked: (contract) => current.current.relay.isLocked(contract),
          records: () =>
            current.current.relay.lifecycle?.records ??
            current.current.relay.records,
          submit: (signed, onAttempt) =>
            current.current.relay.submit(signed, onAttempt),
          validate: async (request, reviewRuntime) => {
            assertForm();
            const scope = JSON.stringify(runtime.getScope());
            const wallet = runtime.getScope().wallet;
            // KYC and balances are independent reads.
            const [{ data }] = await Promise.all([
              apollo.query({
                query: USER_ACCOUNT_STATUS_QUERY,
                variables: { address: wallet },
                fetchPolicy: "network-only",
              }),
              validateOrderPlan(reviewRuntime, request),
            ]);
            if (JSON.stringify(runtime.getScope()) !== scope)
              throw new Error("Wallet changed. Review again.");
            if (!getIsKycedForAddress(data, wallet))
              throw new Error("Verify with Mavryk Pro before trading.");
            assertForm();
          },
        },
        (next) => {
          // Processing starts after the signature; a later wallet prompt (the
          // order after an operator grant) is not "processing".
          const pending = current.current.options.pendingToast;
          if (next !== "processing") hidePendingToast();
          else if (pending && !pendingToastId)
            pendingToastId = loading(pending.title, pending.message, false);
          if (mounted.current) setStep(next);
        }
      );
      plan.current = next;
      await done;
      // Do not erase edits made while the submitted order was being tracked.
      if (
        mounted.current &&
        JSON.stringify(current.current.options.request) === originalKey
      )
        current.current.options.onConfirmed();
    } catch (error) {
      const notice = getRelayFailureNotice(error);
      // Never fall back to MVRK: reread the saved choice and let the user review.
      if (notice?.kind === "payment-mismatch") payment.reload();
      if (mounted.current && notice && current.current.options.inlineNotice)
        setFailure({ ...notice, at: Date.now() });
      // A failed relay row is toasted once by RelayProvider.
      else if (
        mounted.current &&
        !checkWhetherWalletAbortError(error) &&
        !isRelayOutcomeError(error)
      )
        bug(
          getPermitActionErrorMessage(error) ||
            unknownToError(error)?.message ||
            "Unable to complete the action."
        );
    } finally {
      hidePendingToast();
      plan.current = null;
      if (mounted.current) setStep(null);
    }
  };
  return {
    execute,
    isBusy,
    // Same button states as a direct wallet operation.
    status: (step === "processing"
      ? STATUS_CONFIRMING
      : step
        ? STATUS_PENDING
        : STATUS_IDLE) as StatusFlag,
    reason,
    /** Relay availability before signing, or the last relay failure. */
    notice: failure ?? (reason === availability?.message ? availability : null),
    /** `reason` is already explained by `notice`, or is only a pending check. */
    isReasonInline: Boolean(
      reason &&
        (reason === PENDING_AVAILABILITY || reason === availability?.message)
    ),
  };
}
