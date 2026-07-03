/* eslint-disable no-useless-catch */
import { useCallback, useEffect, useRef } from "react";
import {
  STATUS_ERROR,
  STATUS_IDLE,
  STATUS_PENDING,
  STATUS_SUCCESS,
  useStatusFlag,
} from "~/lib/ui/use-status-flag";
import { sleep } from "~/lib/utils/sleep";
import { usePopupContext } from "~/providers/PopupProvider/popup.provider";
import { POPUP_KEYS, txTemplates } from "~/providers/PopupProvider/consts";

// templates
import { useWalletContext } from "~/providers/WalletProvider/wallet.provider";
import { forcedUpdateProxy } from "~/providers/ApolloProvider/utils/observeForcedUpdate";
import { useToasterContext } from "~/providers/ToasterProvider/toaster.provider";
import { unknownToError } from "~/errors/error";

// Simplified version to handle operation calls

export type ContractActionPopupProps = {
  key: keyof typeof POPUP_KEYS;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: any;
};

export type ContractActionToastProps = {
  success: {
    title: string;
    message: string;
  };
};

export const useContractAction = <G,>(
  actionFn: ((args: G) => void) | (() => void),
  args: unknown,
  popupDetails: ContractActionPopupProps | undefined = undefined,
  toastMessages: ContractActionToastProps | undefined = undefined
) => {
  const { dapp } = useWalletContext();
  const { status, dispatch, isLoading } = useStatusFlag();
  const { showPopup, popupKeys, hidePopup } = usePopupContext();
  const { success, bug } = useToasterContext();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const invokeAction = useCallback(async () => {
    try {
      const tezos = dapp?.tezos();

      if (!tezos) return;

      dispatch(STATUS_PENDING);

      timeoutRef.current = setTimeout(() => {
        if (popupDetails) {
          showPopup(
            popupKeys[popupDetails.key],
            txTemplates[popupDetails.key](popupDetails.props)
          );
        }
      }, 1500);

      await actionFn({ ...(args as G), tezos });

      // if (popupDetails) {
      //   hidePopup(popupKeys[popupDetails.key]);
      // }

      dispatch(STATUS_SUCCESS);
      success(
        toastMessages?.success?.title || "Action executed successfully",
        toastMessages?.success?.message || "Success"
      );

      // force refetching essential data (it is reseted in useQueryWithRefetch hook)
      forcedUpdateProxy.hasForcedUpdate = true;
      await sleep(2000);

      dispatch(STATUS_IDLE);
    } catch (e) {
      if (popupDetails) {
        hidePopup(popupKeys[popupDetails.key]);
      }
      const err = unknownToError(e);
      dispatch(STATUS_ERROR);

      bug(err?.message || "An error occurred while invoking action");
      await sleep(2000);

      dispatch(STATUS_IDLE);
    }
  }, [
    actionFn,
    args,
    bug,
    dapp,
    dispatch,
    hidePopup,
    popupDetails,
    popupKeys,
    showPopup,
    success,
    toastMessages?.success?.message,
    toastMessages?.success?.title,
  ]);

  return { invokeAction, isLoading, status };
};
