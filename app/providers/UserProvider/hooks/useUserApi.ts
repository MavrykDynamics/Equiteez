import { useCallback, useMemo } from 'react';

// consts
import { DEFAULT_USER } from '../helpers/user.consts';

// types
import { UserContextStateType } from '../user.provider.types';

import { dappClient } from 'app/providers/WalletProvider/WalletCore.client';
import { HubConnection } from '@microsoft/signalr';

type UseUserApiType = {
  DAPP_INSTANCE: ReturnType<typeof dappClient> | null;
  // setters for loadings in user provider
  setUserLoading: (newLoading: boolean) => void;

  // setters for user data in user provider
  setUserCtxState: React.Dispatch<React.SetStateAction<UserContextStateType>>;
  tzktSocket: HubConnection | null;
  setTzktSocket: (socket: HubConnection | null) => void;
};

/**
 * hook to handle CRUD with user (connect, changeWallet, signOut)
 * SHOULD BE USED ONLY IN UserProvider
 */
export const useUserApi = ({
  DAPP_INSTANCE,
  setUserLoading,
  setUserCtxState,
  tzktSocket,
  setTzktSocket,
}: UseUserApiType) => {
  /**
   * connect user's wallet to DAPP:
   * load tzkt balances and set user's address to ctx (inside loadInitialTzktTokensForNewlyConnectedUser) to make QueryWithRefetch work
   */
  const connect = useCallback(async () => {
    try {
      await DAPP_INSTANCE?.connectAccount();
    } catch (e) {
      console.error(`Failed to connect wallet:`, e);
      // bug('Failed to connect wallet', TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
    }
  }, [DAPP_INSTANCE]);

  const changeUser = useCallback(async () => {
    try {
      await DAPP_INSTANCE?.connectAccount();
    } catch (e) {
      console.error(`Failed to change wallet: `, e);
    }
  }, [DAPP_INSTANCE]);

  /**
   * disconnect user's wallet to DAPP & set context to no user state
   */
  const signOut = useCallback(async () => {
    try {
      await tzktSocket?.stop();
      setTzktSocket(null);

      await DAPP_INSTANCE?.disconnectWallet();

      setUserCtxState(DEFAULT_USER);
      setUserLoading(false);
    } catch (e) {
      console.error(`Failed to disconnect wallet: `, e);
      // bug(
      //   'Failed to disconnect wallet',
      //   TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title']
      // );
    }
  }, [
    DAPP_INSTANCE,
    setTzktSocket,
    setUserCtxState,
    setUserLoading,
    tzktSocket,
  ]);

  const returnValue = useMemo(
    () => ({
      connect,
      signOut,
      changeUser,
    }),
    [connect, signOut, changeUser]
  );

  return returnValue;
};
