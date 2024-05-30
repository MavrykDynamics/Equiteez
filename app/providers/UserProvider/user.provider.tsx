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
import { getItemFromStorage } from '~/utils/local-storage';
import { useAppContext } from '../AppProvider/AppProvider';
import { isNullOrUndefined } from '~/utils/is-empty';

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
  // track whether we've loaded user on init, if we have his wallet data in local storage
  const isUserRestored = useRef<boolean>(false);

  const tzktSocket = useRef<null | signalR.HubConnection>(null);

  const [userCtxState, setUserCtxState] =
    useState<UserContextStateType>(DEFAULT_USER);
  const [userTzktTokens, setUserTzktTokens] = useState<UserTzKtTokenBalances>(
    DEFAULT_USER_TZKT_TOKENS
  );

  const hasUserInLocalStorage = useMemo(
    () =>
      IS_WEB
        ? !isNullOrUndefined(
            getItemFromStorage<string>('beacon:active-account')
          )
        : false,
    [IS_WEB]
  );

  const [isTzktBalancesLoading, setIsTzktBalancesLoading] = useState(false);
  const [isUserLoading, setUserLoading] = useState(true);

  /**
   * we can start restoring user from localStorage if:
   *    1. we have his data in localStorage
   *    2. we have tokensAddresses we need to load balances for
   *    3. we have mvnToken address, so set its balance
   *    4. we haven't loaded user data previously in this app mount
   *    5. we have tzktSocket started to attach listeners to it
   */
  const canRestoreUser =
    hasUserInLocalStorage &&
    // Object.keys(tokensMetadata).length &&
    // mvnTokenAddress &&
    !isUserRestored.current;
  // tzktSocket.current

  // open socket for tzkt without listeners, cuz don't have user address to subscribe
  useEffect(() => {
    if (IS_WEB) {
      openTzktWebSocket()
        .then((socket) => (tzktSocket.current = socket))
        .catch((e) => console.error(e));
    }

    return () => {
      tzktSocket?.current?.stop();
      isUserRestored.current = false;
    };
  }, [IS_WEB]);

  // getter & setter for tzktSocket
  const getTzktSocket = useCallback(() => tzktSocket.current, []);
  const setTzktSocket = useCallback(
    (newTzktSocket: signalR.HubConnection | null) =>
      (tzktSocket.current = newTzktSocket),
    []
  );

  const { changeUser, connect, signOut } = useUserApi({
    DAPP_INSTANCE: dapp,
    setUserLoading,
    setIsTzktBalancesLoading,
    setUserCtxState,
    setUserTzktTokens,

    getTzktSocket,
    setTzktSocket,

    userCtxState,
  });

  // effect to perform restoring user from localStorage
  useEffect(() => {
    if (canRestoreUser) connect();
  }, [canRestoreUser, connect]);

  useEffect(() => {
    // do it only on frontend side to avoid infinite loading spinner when trying to get user
    if (IS_WEB) {
      if (userCtxState.userAddress || !canRestoreUser) {
        setUserLoading(false);
      }
    }
  }, [userCtxState.userAddress, IS_WEB, canRestoreUser]);

  const providerValue = useMemo(() => {
    const isLoading = isUserLoading;
    // const isLoading = isUserLoading || isTzktBalancesLoading;

    /**
     * set isUserRestored to true, when:
     *    1. we haven't restored user
     *    2. we have user address set in context (user data loading started)
     *    3. loading are false, means, that user has been loaded
     *    or 4. we don't have user's wallet in localStorage, and we can't restore him
     */
    if (
      (!isUserRestored.current && userCtxState.userAddress && !isLoading) ||
      !hasUserInLocalStorage
    ) {
      isUserRestored.current = true;
    }

    return {
      ...userCtxState,
      userTokensBalances: {
        ...userCtxState.userTokensBalances,
        ...(userCtxState.userAddress === userTzktTokens.userAddress
          ? userTzktTokens.tokens
          : {}),
      },
      isUserRestored: isUserRestored.current,
      isLoading,
      connect,
      signOut,
      changeUser,
    };
  }, [
    isUserLoading,
    userCtxState,
    hasUserInLocalStorage,
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
