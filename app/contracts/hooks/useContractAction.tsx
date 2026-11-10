/* eslint-disable no-useless-catch */
import { useCallback, useEffect, useRef } from "react";
import type { MavrykToolkit } from "@mavrykdynamics/taquito";
import {
  STATUS_CONFIRMING,
  STATUS_ERROR,
  STATUS_IDLE,
  STATUS_PENDING,
  STATUS_SUCCESS,
  type StatusFlag,
  useStatusFlag,
} from "~/lib/ui/use-status-flag";
import { sleep } from "~/lib/utils/sleep";
import { usePopupContext } from "~/providers/PopupProvider/popup.provider";
import { txTemplates } from "~/providers/PopupProvider/consts";

// templates
import { useWalletContext } from "~/providers/WalletProvider/wallet.provider";
import { forcedUpdateProxy } from "~/providers/ApolloProvider/utils/observeForcedUpdate";
import { useToasterContext } from "~/providers/ToasterProvider/toaster.provider";
import { unknownToError } from "~/errors/error";
import { executeTrackedAction } from "~/services/direct/executor";
import { assertActionAvailable } from "~/providers/WalletProvider/capabilities";
import { toCapabilityContext } from "~/providers/WalletProvider/useActionAvailability";
import type {
  ContractActionConfirmation,
  ContractActionLifecycleCallbacks,
  ContractActionSuccessMetadata,
} from "../actions.type";
import { classifyContractActionError } from "./contractActionError";

// Simplified version to handle operation calls

type TxTemplateKey = keyof typeof txTemplates;

export type ContractActionPopupProps = {
  key: TxTemplateKey;
  props: Parameters<(typeof txTemplates)[TxTemplateKey]>[0];
};

export type ContractActionToastProps = {
  pending?: {
    title: string;
    message: string;
  };
  success: {
    title: string;
    message: string;
  };
};

type ContractActionRuntimeParams = {
  tezos: MavrykToolkit;
} & ContractActionLifecycleCallbacks;

type ContractActionFn<G extends object> = (
  args: G & ContractActionRuntimeParams
) => Promise<void> | void;

type ContractActionOptions = {
  onSuccess?: (metadata: ContractActionSuccessMetadata) => void;
  /**
   * Names the action for duplicate protection, e.g. "orderbook.buy". The
   * same action with the same arguments is one intent.
   */
  action?: string;
};

export const useContractAction = <G extends object>(
  actionFn: ContractActionFn<G>,
  args: G,
  popupDetails: ContractActionPopupProps | undefined = undefined,
  toastMessages: ContractActionToastProps | undefined = undefined,
  contractActionOptions: ContractActionOptions = {}
) => {
  const { getIdentity, getToolkit, directExecution } = useWalletContext();
  const { status, dispatch, isLoading } = useStatusFlag();
  const { showPopup, popupKeys, hidePopup } = usePopupContext();
  const { success, bug, loading, warning, hideToasterMessage } =
    useToasterContext();
  const { onSuccess, action } = contractActionOptions;
  const hasSubmittedRef = useRef(false);
  const confirmationRef = useRef<ContractActionConfirmation | null>(null);
  const isMountedRef = useRef(true);
  // One invocation at a time per hook: a second click must not reset the
  // refs or status of the transaction already in flight
  const isInFlightRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const dispatchIfMounted = useCallback(
    (nextStatus: StatusFlag) => {
      if (isMountedRef.current) {
        dispatch(nextStatus);
      }
    },
    [dispatch]
  );

  const showTransactionPopup = useCallback(() => {
    if (!popupDetails) return;

    showPopup(
      popupKeys[popupDetails.key],
      txTemplates[popupDetails.key](popupDetails.props)
    );
  }, [popupDetails, popupKeys, showPopup]);

  const invokeAction = useCallback(async () => {
    if (isInFlightRef.current) return;
    isInFlightRef.current = true;

    let pendingToastId: string | undefined;

    const hidePendingToast = () => {
      if (pendingToastId) {
        hideToasterMessage(pendingToastId);
        pendingToastId = undefined;
      }
    };

    hasSubmittedRef.current = false;
    confirmationRef.current = null;

    try {
      const tezos = getToolkit();

      if (!tezos) return;

      const actionName =
        action ?? popupDetails?.key ?? (actionFn.name || "action");
      const identity = getIdentity();

      // Also enforced for a stale or forgotten control
      if (identity) {
        assertActionAvailable(actionName, toCapabilityContext(identity));
      }

      dispatchIfMounted(STATUS_PENDING);

      const lifecycleCallbacks =
        args as Partial<ContractActionLifecycleCallbacks>;

      await executeTrackedAction({
        tracking: directExecution?.tracking ?? null,
        action: actionName,
        intent: args,
        run: (hooks) =>
          Promise.resolve(
            actionFn({
              ...args,
              tezos,
              execution: directExecution?.options,
              onTransactionSubmitted: (submission) => {
                if (submission) hooks.onSubmitted(submission.opHash);
                lifecycleCallbacks.onTransactionSubmitted?.(submission);
                hasSubmittedRef.current = true;
                dispatchIfMounted(STATUS_CONFIRMING);
                showTransactionPopup();
                if (toastMessages?.pending && !pendingToastId) {
                  pendingToastId = loading(
                    toastMessages.pending.title,
                    toastMessages.pending.message,
                    false
                  );
                }
              },
              onTransactionConfirmed: (confirmation) => {
                hooks.onApplied();
                confirmationRef.current = confirmation;
                lifecycleCallbacks.onTransactionConfirmed?.(confirmation);
              },
            })
          ),
      });

      hidePendingToast();
      dispatchIfMounted(STATUS_SUCCESS);
      success(
        toastMessages?.success?.title || "Action executed successfully",
        toastMessages?.success?.message || "Success"
      );

      // force refetching essential data (it is reseted in useQueryWithRefetch hook)
      forcedUpdateProxy.hasForcedUpdate = true;

      if (popupDetails && hasSubmittedRef.current) {
        await hidePopup(popupKeys[popupDetails.key]);
      }

      onSuccess?.({ confirmation: confirmationRef.current });
      await sleep(2000);

      dispatchIfMounted(STATUS_IDLE);
    } catch (e) {
      hidePendingToast();
      const hasTransactionSubmitted = hasSubmittedRef.current;

      if (popupDetails && hasTransactionSubmitted) {
        await hidePopup(popupKeys[popupDetails.key]);
      }

      const errorKind = classifyContractActionError(e, {
        hasSubmitted: hasTransactionSubmitted,
      });

      // Another tab is submitting the same action: leave the status alone
      if (errorKind === "in-progress") return;

      if (errorKind === "abort") {
        dispatchIfMounted(STATUS_ERROR);
        await sleep(2000);
        dispatchIfMounted(STATUS_IDLE);
        return;
      }

      if (errorKind === "still-processing") {
        warning(
          "Transaction is still processing",
          unknownToError(e)?.message ||
            "Your transaction was sent. Check its status before trying again."
        );
        dispatchIfMounted(STATUS_IDLE);
        return;
      }

      const err = unknownToError(e);
      dispatchIfMounted(STATUS_ERROR);

      bug(err?.message || "An error occurred while invoking action");
      await sleep(2000);

      dispatchIfMounted(STATUS_IDLE);
    } finally {
      isInFlightRef.current = false;
    }
  }, [
    action,
    actionFn,
    args,
    bug,
    directExecution,
    getIdentity,
    getToolkit,
    dispatchIfMounted,
    hidePopup,
    hideToasterMessage,
    loading,
    onSuccess,
    popupDetails,
    popupKeys,
    showTransactionPopup,
    success,
    toastMessages?.pending,
    toastMessages?.success?.message,
    toastMessages?.success?.title,
    warning,
  ]);

  return { invokeAction, isLoading, status };
};
