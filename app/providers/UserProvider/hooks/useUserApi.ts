import { useCallback, useMemo } from 'react';

// consts
import { DEFAULT_USER } from '../helpers/user.consts';

// types
import {
  UserContextStateType,
  UserTzKtTokenBalances,
  UserTzktTokensBalancesType,
} from '../user.provider.types';

import { fetchTzktUserBalances } from '../helpers/userBalances.helpers';

import { dappClient } from 'app/providers/WalletProvider/WalletCore.client';

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

  const returnValue = useMemo(
    () => ({
      connect,
      signOut,
      loadInitialTzktTokensForNewlyConnectedUser,
      updateUserTzktTokenBalances,
    }),
    [
      connect,
      signOut,
      loadInitialTzktTokensForNewlyConnectedUser,
      updateUserTzktTokenBalances,
    ]
  );

  return returnValue;
};
