import { useCallback, useEffect, useMemo, useRef } from 'react';
import { ADMIN_ADDRESSES } from './user.consts';
import {
  attachTzktSocketsEventHandlers,
  fetchTzktUserBalances,
  normalizeUserTzktTokensBalances,
  openTzktWebSocket,
} from './userBalances.helpers';
import { sleep } from '~/lib/utils/sleep';
import { useTokensContext } from '~/providers/TokensProvider/tokens.provider';
import {
  UserContextStateType,
  UserTzKtTokenBalances,
  UserTzktTokensBalancesType,
} from '../user.provider.types';
import { useAppContext } from '~/providers/AppProvider/AppProvider';

// types
import type { HubConnection } from '@microsoft/signalr';
import { TokenMetadata } from '~/lib/metadata';

type UseUserSocketsType = {
  setIsTzktBalancesLoading: (newLoading: boolean) => void;

  // setters for user data in user provider
  setUserCtxState: React.Dispatch<React.SetStateAction<UserContextStateType>>;
  setUserTzktTokens: React.Dispatch<
    React.SetStateAction<UserTzKtTokenBalances>
  >;
};

export const useUserSockets = ({
  setIsTzktBalancesLoading,
  setUserCtxState,
  setUserTzktTokens,
}: UseUserSocketsType) => {
  const { tokensMetadata } = useTokensContext();
  const { IS_WEB } = useAppContext();

  const tzktSocketRef = useRef<null | HubConnection>(null);

  // getter & setter for tzktSocket
  const getTzktSocket = useCallback(() => tzktSocketRef.current, []);
  const setTzktSocket = useCallback(
    (newTzktSocket: signalR.HubConnection | null) =>
      (tzktSocketRef.current = newTzktSocket),
    []
  );

  const tzktSocket = useMemo(() => getTzktSocket(), [getTzktSocket]);

  useEffect(() => {
    if (IS_WEB) {
      openTzktWebSocket()
        .then((socket) => (tzktSocketRef.current = socket))
        .catch((e) => console.error(e));
    }

    return () => {
      tzktSocketRef?.current?.stop();
    };
  }, [IS_WEB]);

  /**
   * update user's tzkt tokens in userProvider context
   */
  const updateUserTzktTokenBalances = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (userAddress: string) => (userTokens: UserTzktTokensBalancesType) => {
      const normalizedTzktUserTokens = normalizeUserTzktTokensBalances({
        indexerData: userTokens,
        userAddress,
        tokensMetadata,
      });
      setUserTzktTokens((prev) => ({
        ...prev,
        tokens: {
          ...prev.tokens,
          ...normalizedTzktUserTokens,
        },
      }));
    },
    [tokensMetadata]
  );

  /**
   * when user connects wallet or changing wallet we need to load all his tokens from tzkt, cuz ws does not return full tokens, only updated
   */
  const loadInitialTzktTokensForNewlyConnectedUser = useCallback(
    async ({
      userAddress,
      tokensMetadata,
      isUsingLoader = true,
    }: {
      userAddress: string;
      tokensMetadata: StringRecord<TokenMetadata>;
      isUsingLoader?: boolean;
    }) => {
      if (isUsingLoader) setIsTzktBalancesLoading(true);

      setUserCtxState((prev) => ({
        ...prev,
        userAddress,
        isAdmin: ADMIN_ADDRESSES[userAddress],
      }));

      const fetchedTokens = await fetchTzktUserBalances({
        userAddress,
        tokensMetadata,
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
      await loadInitialTzktTokensForNewlyConnectedUser({
        userAddress,
        tokensMetadata,
      });
      await sleep(500);
      // hideToasterMessage(loadingToasterId);
      console.log('TZKT tokens balances has been updated', 'TZKT connection');
    },
    [loadInitialTzktTokensForNewlyConnectedUser, tokensMetadata]
  );

  const updateTzktConnection = useCallback(
    async (newUserAddress: string) => {
      if (tzktSocket !== null) {
        await tzktSocket?.stop();

        const newTzktSocket = await openTzktWebSocket();
        setTzktSocket(newTzktSocket);
      }

      // await loadInitialTzktTokensForNewlyConnectedUser({
      //   userAddress: newUserAddress,
      //   tokensMetadata,
      //   isUsingLoader: false,
      // });

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

  return { updateTzktConnection, loadInitialTzktTokensForNewlyConnectedUser };
};
