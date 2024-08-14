import {
  createContext,
  FC,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { DEFAULT_POPUPS_STATE, POPUP_KEYS } from './consts';
import {
  TransactionOperationPopup,
  TransactionOperationPopupProps,
} from './popups/TransactionOperationPopup/TransactionOperationPopup';
import { PopupProviderContext, PopupState } from './popup.provider.types';
import { sleep } from '~/lib/utils/sleep';
import { DEFAULT_POPUP_ANIMATION_DELAY } from '~/lib/organisms/CustomPopup/CustomPopup';

const popupContext = createContext<PopupProviderContext>(undefined!);

export const PopupProvider: FC<PropsWithChildren> = ({ children }) => {
  const [popupsState, setPopupsState] =
    useState<PopupState>(DEFAULT_POPUPS_STATE);

  const showPopup = useCallback(
    <G,>(key: string, props: G) => {
      setPopupsState({ ...popupsState, [key]: { show: true, props } });
    },
    [popupsState]
  );

  const hidePopup = useCallback(
    async (key: string) => {
      setPopupsState({
        ...popupsState,
        [key]: {
          show: false,
          // TODO adjust types
          props: popupsState[key as keyof typeof POPUP_KEYS].props,
        },
      });

      await sleep(DEFAULT_POPUP_ANIMATION_DELAY);
      setPopupsState({
        ...popupsState,
        [key]: {
          show: false,
          props: DEFAULT_POPUPS_STATE[key as keyof typeof POPUP_KEYS].props,
        },
      });
    },
    [popupsState]
  );

  const memoizedPopupVal = useMemo(
    () => ({
      showPopup,
      hidePopup,
      popupKeys: POPUP_KEYS,
    }),
    [hidePopup, showPopup]
  );

  return (
    <popupContext.Provider value={memoizedPopupVal}>
      {children}
      <TransactionOperationPopup
        isOpen={popupsState.txOperation.show}
        onRequestClose={() => hidePopup(POPUP_KEYS.txOperation)}
        {...(popupsState.txOperation.props as Omit<
          TransactionOperationPopupProps,
          'isOpen'
        >)}
      />
    </popupContext.Provider>
  );
};

export const usePopupContext = () => {
  const ctx = useContext(popupContext);

  if (!ctx) {
    throw new Error(
      `${usePopupContext.name} must ne used within ${PopupProvider.name}`
    );
  }
  return ctx;
};
