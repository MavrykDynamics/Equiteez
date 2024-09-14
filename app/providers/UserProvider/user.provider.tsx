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
import { openTzktWebSocket } from './helpers/userBalances.helpers';

import {
  UserContext,
  UserContextStateType,
  UserTzKtTokenBalances,
} from './user.provider.types';
import { useWalletContext } from '../WalletProvider/wallet.provider';
import { useAppContext } from '../AppProvider/AppProvider';
import { AccountInfo } from '@mavrykdynamics/beacon-dapp';
import { useTokensContext } from '../TokensProvider/tokens.provider';

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
  const { tokensMetadata } = useTokensContext();

  const tzktSocket = useRef<null | signalR.HubConnection>(null);

  /**
   * when undefined -> isLoading is true
   * when null, there isn't active account -> isLoading false
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
    openTzktWebSocket()
      .then((socket) => (tzktSocket.current = socket))
      .catch((e) => console.error(e));

    return () => {
      tzktSocket?.current?.stop();
    };
  }, []);

  // getter & setter for tzktSocket
  const getTzktSocket = useCallback(() => tzktSocket.current, []);
  const setTzktSocket = useCallback(
    (newTzktSocket: signalR.HubConnection | null) =>
      (tzktSocket.current = newTzktSocket),
    []
  );

  // user hook used ONLY inside user provider
  // returns methids to communicated with wallet and get data about account
  // as well as tzkt sockets communication
  const { connect, signOut, updateTzktConnection, changeUser } = useUserApi({
    DAPP_INSTANCE: dapp,
    setUserLoading,
    setIsTzktBalancesLoading,
    setUserCtxState,
    setUserTzktTokens,

    getTzktSocket,
    setTzktSocket,

    userCtxState,
    tokensMetadata,
  });

  // Listening for active account changes with beacon
  useEffect(() => {
    if (IS_WEB && dapp) {
      (async function () {
        try {
          // if no account, event to listen for active acc is not triggered, so we manually set acc to null
          const acc = await dapp?.getDAppClient().getActiveAccount();
          if (!acc) setAccount(null);

          dapp?.listenToActiveAccount(setAccount);
        } catch (err) {
          console.log(err);
        }
      })();
    }
  }, [IS_WEB, dapp]);

  // account is updated when we trigger wallet account connect | disconnect | change acc
  // whenever account is updated - we reconnect tzkt socket to have up-to-date data
  useEffect(() => {
    if (IS_WEB) {
      if (account) {
        setUserLoading(false);
        (async function () {
          try {
            await updateTzktConnection(account.address);
          } catch (e) {
            console.log(e);
          }
        })();
      } else if (account === null) {
        (async function () {
          setUserLoading(false);
          const tzktSocket = getTzktSocket();
          await tzktSocket?.stop();

          setTzktSocket(null);
        })();
      }
    }
  }, [IS_WEB, account, getTzktSocket, setTzktSocket, updateTzktConnection]);

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
      changeUser,
    };
  }, [
    isUserLoading,
    userCtxState,
    userTzktTokens.userAddress,
    userTzktTokens.tokens,
    connect,
    signOut,
    changeUser,
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
