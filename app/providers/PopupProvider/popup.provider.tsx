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
    (key: string) => {
      setPopupsState({ ...popupsState, [key]: { show: false, props: null } });
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
      {popupsState.txOperation.props && (
        <TransactionOperationPopup
          isOpen={popupsState.txOperation.show}
          {...(popupsState.txOperation.props as Omit<
            TransactionOperationPopupProps,
            'isOpen'
          >)}
        />
      )}
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
