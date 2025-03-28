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

// templates
import {
  popupOperationSuccess,
  popupOperationError,
} from "../templates/operationPopupData";
import { useWalletContext } from "~/providers/WalletProvider/wallet.provider";
import { useMarketsContext } from "~/providers/MarketsProvider/markets.provider";

// Simplified version to handle operation calls
// TODO adjust logic based on the new requirements

export const useContractAction = <G,>(
  actionFn: ((args: G) => void) | (() => void),
  args: unknown
) => {
  const { dapp } = useWalletContext();
  const { status, dispatch, isLoading } = useStatusFlag();
  const { showPopup, popupKeys } = usePopupContext();
  const { activeMarket } = useMarketsContext();

  const invokeAction = useCallback(async () => {
    try {
      const tezos = dapp?.tezos();

      if (!tezos) return;

      dispatch(STATUS_PENDING);

      const shouldShowPopup = await actionFn({ ...(args as G), tezos });
      if (shouldShowPopup === undefined) {
        dispatch(STATUS_SUCCESS);
        showPopup(
          popupKeys.txOperation,
          popupOperationSuccess(activeMarket?.name ?? "Nomad")
        );
        await sleep(2000);
      }

      dispatch(STATUS_IDLE);
    } catch (e) {
      dispatch(STATUS_ERROR);
      showPopup(popupKeys.txOperation, popupOperationError());
      await sleep(2000);

      dispatch(STATUS_IDLE);
    }
  }, [
    actionFn,
    activeMarket?.name,
    args,
    dapp,
    dispatch,
    popupKeys.txOperation,
    showPopup,
  ]);

  return { invokeAction, isLoading, status };
};
