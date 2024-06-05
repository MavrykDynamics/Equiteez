import { useCallback, useMemo } from 'react';

// consts
import { DEFAULT_USER } from '../helpers/user.consts';

// types
import {
  UserContextStateType,
  UserTzKtTokenBalances,
  UserTzktTokensBalancesType,
} from '../user.provider.types';

import {
  attachTzktSocketsEventHandlers,
  fetchTzktUserBalances,
  openTzktWebSocket,
} from '../helpers/userBalances.helpers';

import { dappClient } from 'app/providers/WalletProvider/WalletCore.client';
import { sleep } from '~/utils/sleep';

type UseUserApiType = {
  DAPP_INSTANCE: ReturnType<typeof dappClient> | null;
  // setters for loadings in user provider
  setUserLoading: (newLoading: boolean) => void;
  setIsTzktBalancesLoading: (newLoading: boolean) => void;

  // setters for user data in user provider
  setUserCtxState: React.Dispatch<React.SetStateAction<UserContextStateType>>;
  setUserTzktTokens: React.Dispatch<
    React.SetStateAction<UserTzKtTokenBalances>
  >;

  // getter & setter for tzkt socket
  getTzktSocket: () => signalR.HubConnection | null;
  setTzktSocket: (newTzktSocket: signalR.HubConnection | null) => void;

  userCtxState: UserContextStateType;
};

/**
 * hook to handle CRUD with user (connect, changeWallet, signOut)
 *
 * SHOULD BE USED ONLY IN UserProvider
 */
export const useUserApi = ({
  DAPP_INSTANCE,
  setUserLoading,
  setIsTzktBalancesLoading,
  setUserCtxState,
  setUserTzktTokens,

  getTzktSocket,
  setTzktSocket,
}: UseUserApiType) => {
  const tzktSocket = getTzktSocket();

  /**
   * when user connects wallet or changing wallet we need to load all his tokens from tzkt, cuz ws does not return full tokens, only updated
   */
  const loadInitialTzktTokensForNewlyConnectedUser = useCallback(
    async ({
      userAddress,
      isUsingLoader = true,
    }: {
      userAddress: string;
      isUsingLoader?: boolean;
    }) => {
      if (isUsingLoader) setIsTzktBalancesLoading(true);

      setUserCtxState((prev) => ({
        ...prev,
        userAddress,
      }));

      const fetchedTokens = await fetchTzktUserBalances({
        userAddress,
      });

      setUserTzktTokens({
        userAddress,
        tokens: fetchedTokens ?? {},
      });

      if (isUsingLoader) setIsTzktBalancesLoading(false);
    },
    [setIsTzktBalancesLoading, setUserCtxState, setUserTzktTokens]
  );

  /**
   * update user's tzkt tokens in userProvider context
   */
  const updateUserTzktTokenBalances = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (userAddress: string) => (userTokens: UserTzktTokensBalancesType) => {
      // const normalizedTzktUserTokens = normalizeUserTzktTokensBalances({
      //   indexerData: userTokens,
      //   userAddress,
      // });
      setUserTzktTokens((prev) => ({
        ...prev,
        tokens: {
          ...prev.tokens,
          // ...normalizedTzktUserTokens,
        },
      }));
    },
    []
  );

  /**
   * handle tzkt socket close or reconnecting events
   */
  const handleDisconnect = useCallback((error?: Error) => {
    if (error) {
      console.error('tzkt socket disconnected: ', { error });
      // bug(
      //   'Connection to TZKT has been lost, try to reload page',
      //   'TZKT connection'
      // );
    }
  }, []);

  /**
   * handle tzkt socket reconnected event, need to update all tzkt tokens, cuz balances might have changed
   */
  const handleOnReconnected = useCallback(
    async (userAddress: string) => {
      console.log('Connection to TZKT has been resumed', 'TZKT connection');
      await sleep(500);
      // const loadingToasterId = loading(
      //   'Updating balances of TZKT tokens...',
      //   'TZKT connection'
      // );
      await loadInitialTzktTokensForNewlyConnectedUser({ userAddress });
      await sleep(500);
      // hideToasterMessage(loadingToasterId);
      console.log('TZKT tokens balances has been updated', 'TZKT connection');
    },
    [loadInitialTzktTokensForNewlyConnectedUser]
  );

  /**
   * connect user's wallet to DAPP:
   * load tzkt balances and set user's address to ctx (inside loadInitialTzktTokensForNewlyConnectedUser) to make QueryWithRefetch work
   */
  const connect = useCallback(async () => {
    try {
      await DAPP_INSTANCE?.connectAccount();
    } catch (e) {
      setUserLoading(false);
      console.error(`Failed to connect wallet:`, e);
      // bug('Failed to connect wallet', TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
    }
  }, [DAPP_INSTANCE, setUserLoading]);

  const changeUser = useCallback(async () => {
    try {
      await DAPP_INSTANCE?.connectAccount();
    } catch (e) {
      console.error(`Failed to change wallet: `, e);
    }
  }, [DAPP_INSTANCE]);

  const updateTzktConnection = useCallback(
    async (newUserAddress: string) => {
      if (tzktSocket !== null) {
        await tzktSocket?.stop();

        const newTzktSocket = await openTzktWebSocket();
        setTzktSocket(newTzktSocket);
      }

      await loadInitialTzktTokensForNewlyConnectedUser({
        userAddress: newUserAddress,
        isUsingLoader: false,
      });

      if (tzktSocket) {
        attachTzktSocketsEventHandlers({
          userAddress: newUserAddress,
          handleTokens: updateUserTzktTokenBalances(newUserAddress),
          tzktSocket,
          handleDisconnect,
          handleOnReconnected,
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      // DO NOT update deps with tzktSocket, cuz it will trigger tzkt connection errors
      handleDisconnect,
      handleOnReconnected,
      loadInitialTzktTokensForNewlyConnectedUser,
      setTzktSocket,
      updateUserTzktTokenBalances,
    ]
  );

  /**
   * disconnect user's wallet to DAPP & set context to no user state
   */
  const signOut = useCallback(async () => {
    try {
      await DAPP_INSTANCE?.disconnectWallet();

      setUserCtxState(DEFAULT_USER);
    } catch (e) {
      console.error(`Failed to disconnect wallet: `, e);
      // bug(
      //   'Failed to disconnect wallet',
      //   TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title']
      // );
    }
  }, [DAPP_INSTANCE, setUserCtxState]);

  const returnValue = useMemo(
    () => ({
      connect,
      signOut,
      changeUser,
      updateTzktConnection,
    }),
    [connect, signOut, updateTzktConnection, changeUser]
  );

  return returnValue;
};
