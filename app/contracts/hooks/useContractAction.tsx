/* eslint-disable no-useless-catch */
import { useCallback } from "react";
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

// Simplified version to handle operation calls

export type ContractActionPopupProps = {
  key: keyof typeof POPUP_KEYS;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  props: any;
};

export const useContractAction = <G,>(
  actionFn: ((args: G) => void) | (() => void),
  args: unknown,
  popupDetails?: ContractActionPopupProps
) => {
  const { dapp } = useWalletContext();
  const { status, dispatch, isLoading } = useStatusFlag();
  const { showPopup, popupKeys } = usePopupContext();

  const invokeAction = useCallback(async () => {
    try {
      const tezos = dapp?.tezos();

      if (!tezos) return;

      dispatch(STATUS_PENDING);

      const shouldShowPopup = await actionFn({ ...(args as G), tezos });
      if (shouldShowPopup === undefined && popupDetails) {
        dispatch(STATUS_SUCCESS);
        showPopup(
          popupKeys[popupDetails.key],
          txTemplates[popupDetails.key].success(popupDetails.props)
        );

        // force refetching essential data (it is reseted in useQueryWithRefetch hook)
        forcedUpdateProxy.hasForcedUpdate = true;
        await sleep(2000);
      }

      dispatch(STATUS_IDLE);
    } catch (e) {
      dispatch(STATUS_ERROR);
      if (popupDetails)
        showPopup(
          popupKeys[popupDetails.key],
          txTemplates[popupDetails.key].error()
        );
      await sleep(2000);

      dispatch(STATUS_IDLE);
    }
  }, [actionFn, args, dapp, dispatch, popupDetails, popupKeys, showPopup]);

  return { invokeAction, isLoading, status };
};
