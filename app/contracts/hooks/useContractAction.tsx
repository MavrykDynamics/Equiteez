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
import { checkWhetherWalletAbortError, unknownToError } from "~/errors/error";
import type { ContractActionLifecycleCallbacks } from "../actions.type";

// Simplified version to handle operation calls

type TxTemplateKey = keyof typeof txTemplates;

export type ContractActionPopupProps = {
  key: TxTemplateKey;
  props: Parameters<(typeof txTemplates)[TxTemplateKey]>[0];
};

export type ContractActionToastProps = {
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
  onSuccess?: () => void;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const getStringField = (value: Record<string, unknown>, key: string) => {
  const field = value[key];

  return typeof field === "string" ? field : "";
};

const isWalletAbortActionError = (rawError: unknown) => {
  if (checkWhetherWalletAbortError(rawError)) return true;

  if (!isRecord(rawError)) return false;

  const name = getStringField(rawError, "name");
  const title = getStringField(rawError, "title");
  const message = getStringField(rawError, "message").toLowerCase();

  return (
    name === "AbortError" ||
    name === "AbortedBeaconError" ||
    title === "Aborted" ||
    message.includes("aborted")
  );
};

export const useContractAction = <G extends object>(
  actionFn: ContractActionFn<G>,
  args: G,
  popupDetails: ContractActionPopupProps | undefined = undefined,
  toastMessages: ContractActionToastProps | undefined = undefined,
  contractActionOptions: ContractActionOptions = {}
) => {
  const { dapp } = useWalletContext();
  const { status, dispatch, isLoading } = useStatusFlag();
  const { showPopup, popupKeys, hidePopup } = usePopupContext();
  const { success, bug } = useToasterContext();
  const { onSuccess } = contractActionOptions;
  const hasSubmittedRef = useRef(false);
  const isMountedRef = useRef(true);

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
    hasSubmittedRef.current = false;

    try {
      const tezos = dapp?.tezos();

      if (!tezos) return;

      dispatchIfMounted(STATUS_PENDING);

      await actionFn({
        ...args,
        tezos,
        onTransactionSubmitted: () => {
          hasSubmittedRef.current = true;
          dispatchIfMounted(STATUS_CONFIRMING);
          showTransactionPopup();
        },
      });

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

      onSuccess?.();
      await sleep(2000);

      dispatchIfMounted(STATUS_IDLE);
    } catch (e) {
      const hasTransactionSubmitted = hasSubmittedRef.current;

      if (popupDetails && hasTransactionSubmitted) {
        await hidePopup(popupKeys[popupDetails.key]);
      }

      if (!hasTransactionSubmitted && isWalletAbortActionError(e)) {
        dispatchIfMounted(STATUS_ERROR);
        await sleep(2000);
        dispatchIfMounted(STATUS_IDLE);
        return;
      }

      const err = unknownToError(e);
      dispatchIfMounted(STATUS_ERROR);

      bug(err?.message || "An error occurred while invoking action");
      await sleep(2000);

      dispatchIfMounted(STATUS_IDLE);
    }
  }, [
    actionFn,
    args,
    bug,
    dapp,
    dispatchIfMounted,
    hidePopup,
    onSuccess,
    popupDetails,
    popupKeys,
    showTransactionPopup,
    success,
    toastMessages?.success?.message,
    toastMessages?.success?.title,
  ]);

  return { invokeAction, isLoading, status };
};
