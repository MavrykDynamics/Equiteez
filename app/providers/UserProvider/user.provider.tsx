import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as signalR from '@microsoft/signalr';

// consts
import { DEFAULT_USER, DEFAULT_USER_TZKT_TOKENS } from './helpers/user.consts';

// hooks
import { useUserApi } from './hooks/useUserApi';

// helpers
import {
  attachTzktSocketsEventHandlers,
  openTzktWebSocket,
} from './helpers/userBalances.helpers';

import {
  UserContext,
  UserContextStateType,
  UserTzKtTokenBalances,
} from './user.provider.types';
import { useWalletContext } from '../WalletProvider/wallet.provider';
import { useAppContext } from '../AppProvider/AppProvider';
import { AccountInfo } from '@mavrykdynamics/beacon-dapp';

export const userContext = React.createContext<UserContext>(undefined!);

type Props = {
  children: React.ReactNode;
};

/**
 * ADJUSTMENTS:
 * 1. on changing user do not reopen socket, just update filter (invoke), currently hadn't found any example of it
 */
export const UserProvider = ({ children }: Props) => {
  const { dapp } = useWalletContext();
  const { IS_WEB } = useAppContext();

  const tzktSocket = useRef<null | signalR.HubConnection>(null);

  /**
   * when undefined -> isLoading is true
   * when null, there isn't active account -> isLoading fasle
   * when active account was received -> isLoading false
   */
  const [account, setAccount] = useState<AccountInfo | null | undefined>();
  const [userCtxState, setUserCtxState] =
    useState<UserContextStateType>(DEFAULT_USER);
  const [userTzktTokens, setUserTzktTokens] = useState<UserTzKtTokenBalances>(
    DEFAULT_USER_TZKT_TOKENS
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setIsTzktBalancesLoading] = useState(false);
  const [isUserLoading, setUserLoading] = useState(true);

  // open socket for tzkt without listeners, cuz don't have user address to subscribe
  useEffect(() => {
    if (IS_WEB) {
      openTzktWebSocket()
        .then((socket) => (tzktSocket.current = socket))
        .catch((e) => console.error(e));
    }

    return () => {
      tzktSocket?.current?.stop();
    };
  }, [IS_WEB]);

  // getter & setter for tzktSocket
  const getTzktSocket = useCallback(() => tzktSocket.current, []);
  const setTzktSocket = useCallback(
    (newTzktSocket: signalR.HubConnection | null) =>
      (tzktSocket.current = newTzktSocket),
    []
  );

  // user hook to set tzkt data and listeners and get methods to communicate with wallet
  // like connect, disconnect etc.
  const {
    connect,
    signOut,
    loadInitialTzktTokensForNewlyConnectedUser,
    updateUserTzktTokenBalances,
    handleDisconnect,
    handleOnReconnected,
  } = useUserApi({
    DAPP_INSTANCE: dapp,
    setUserLoading,
    setIsTzktBalancesLoading,
    setUserCtxState,
    setUserTzktTokens,

    getTzktSocket,
    setTzktSocket,

    userCtxState,
  });

  // Listening for active account changes
  useEffect(() => {
    if (IS_WEB) {
      dapp?.listenToActiveAccount(setAccount);
    }
  }, [IS_WEB, dapp]);

  // listen to tkzt by active account address to get tokens data
  useEffect(() => {
    if (IS_WEB && account) {
      setUserLoading(false);
      (async function () {
        try {
          const tzktSocket = getTzktSocket();

          await loadInitialTzktTokensForNewlyConnectedUser({
            userAddress: account.address,
          });

          console.log(tzktSocket, 'tzktSocket');

          if (tzktSocket) {
            attachTzktSocketsEventHandlers({
              userAddress: account.address,
              handleTokens: updateUserTzktTokenBalances(account.address),
              tzktSocket,
              handleDisconnect,
              handleOnReconnected,
            });
          }
        } catch (e) {
          console.log(e);
        }
      })();
    } else if (account === null) {
      setUserLoading(false);
    }
  }, [
    account,
    IS_WEB,
    loadInitialTzktTokensForNewlyConnectedUser,
    updateUserTzktTokenBalances,
    getTzktSocket,
    handleDisconnect,
    handleOnReconnected,
  ]);

  const providerValue = useMemo(() => {
    const isLoading = isUserLoading;

    return {
      ...userCtxState,
      userTokensBalances: {
        ...userCtxState.userTokensBalances,
        ...(userCtxState.userAddress === userTzktTokens.userAddress
          ? userTzktTokens.tokens
          : {}),
      },
      isLoading,
      connect,
      signOut,
    };
  }, [
    isUserLoading,
    userCtxState,
    userTzktTokens.userAddress,
    userTzktTokens.tokens,
    connect,
    signOut,
  ]);

  return (
    <userContext.Provider value={providerValue}>
      {children}
    </userContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(userContext);

  if (!context) {
    throw new Error('userContext should be used within UserProvider');
  }

  return context;
};

export default UserProvider;
