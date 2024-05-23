import { useCallback, useMemo } from 'react';

// consts
import { DEFAULT_USER } from '../helpers/user.consts';

// types
import {
  UserContextStateType,
  UserTzKtTokenBalances,
  UserTzktTokensBalancesType,
} from '../user.provider.types';

// utils
import { sleep } from 'app/utils/sleep';

import {
  attachTzktSocketsEventHandlers,
  fetchTzktUserBalances,
  openTzktWebSocket,
} from '../helpers/userBalances.helpers';

import { dappClient } from 'app/providers/WalletProvider/WalletCore.client';

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

  userCtxState,
}: {
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
}) => {
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
      const userAddress = await DAPP_INSTANCE?.connectAccount();

      if (userAddress) {
        setUserLoading(true);
        loadInitialTzktTokensForNewlyConnectedUser({ userAddress });

        if (tzktSocket) {
          attachTzktSocketsEventHandlers({
            userAddress,
            handleTokens: updateUserTzktTokenBalances(userAddress),
            tzktSocket,
            handleDisconnect,
            handleOnReconnected,
          });
        }
      } else {
        console.log('No account chosen');
      }
    } catch (e) {
      console.error(`Failed to connect wallet:`, e);
      // bug('Failed to connect wallet', TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title'])
    }
  }, [
    DAPP_INSTANCE,
    setUserLoading,
    loadInitialTzktTokensForNewlyConnectedUser,
    tzktSocket,
    updateUserTzktTokenBalances,
    handleDisconnect,
    handleOnReconnected,
  ]);

  /**
   * disconnect user's wallet to DAPP & set context to no user state
   */
  const signOut = useCallback(async () => {
    try {
      await DAPP_INSTANCE?.disconnectWallet();

      setUserCtxState(DEFAULT_USER);

      await tzktSocket?.stop();
      setTzktSocket(null);
    } catch (e) {
      console.error(`Failed to disconnect wallet: `, e);
      // bug(
      //   'Failed to disconnect wallet',
      //   TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title']
      // );
    }
  }, [DAPP_INSTANCE, setTzktSocket, setUserCtxState, tzktSocket]);

  /**
   * change user's wallet for DAPP, load new data for him and reopen socket for him
   */
  const changeUser = useCallback(async () => {
    try {
      const newUserAddress = await DAPP_INSTANCE?.swapAccount();

      if (newUserAddress && newUserAddress !== userCtxState.userAddress) {
        setUserLoading(true);

        // on user change set all fields to default except address, cuz empty data will appear for a moment, cuz new address will be set in loadInitialTzktTokensForNewlyConnectedUser
        setUserCtxState((prev) => ({
          ...DEFAULT_USER,
          userAddress: prev.userAddress,
        }));

        loadInitialTzktTokensForNewlyConnectedUser({
          userAddress: newUserAddress,
          isUsingLoader: false,
        });

        await tzktSocket?.stop();

        const newTzktSocket = await openTzktWebSocket();
        setTzktSocket(newTzktSocket);

        attachTzktSocketsEventHandlers({
          userAddress: newUserAddress,
          handleTokens: updateUserTzktTokenBalances(newUserAddress),
          tzktSocket: newTzktSocket,
          handleDisconnect,
          handleOnReconnected,
        });
      }
    } catch (e) {
      console.error(`Failed to change wallet: `, e);
      // bug(
      //   'Failed to change wallet',
      //   TOASTER_TEXTS[TOASTER_SUBSCRIPTION_ERROR]['title']
      // );
    }
  }, [
    DAPP_INSTANCE,
    userCtxState.userAddress,
    setUserLoading,
    setUserCtxState,
    loadInitialTzktTokensForNewlyConnectedUser,
    tzktSocket,
    setTzktSocket,
    updateUserTzktTokenBalances,
    handleDisconnect,
    handleOnReconnected,
  ]);

  const returnValue = useMemo(
    () => ({ connect, changeUser, signOut }),
    [connect, changeUser, signOut]
  );

  return returnValue;
};
