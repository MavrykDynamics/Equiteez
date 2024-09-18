import React, { useContext, useEffect, useMemo, useState } from 'react';

// consts
import { DEFAULT_USER, DEFAULT_USER_TZKT_TOKENS } from './helpers/user.consts';

// hooks
import { useUserApi } from './hooks/useUserApi';

import {
  UserContext,
  UserContextStateType,
  UserTzKtTokenBalances,
} from './user.provider.types';
import { useWalletContext } from '../WalletProvider/wallet.provider';
import { useAppContext } from '../AppProvider/AppProvider';
import type { AccountInfo } from '@mavrykdynamics/beacon-dapp';
import { useUserSockets } from './helpers/sockets';
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

  // handle user sockets connection | updates | disconnect
  const { updateTzktConnection, loadInitialTzktTokensForNewlyConnectedUser } =
    useUserSockets({
      setIsTzktBalancesLoading,
      setUserCtxState,
      setUserTzktTokens,
    });

  // user hook used ONLY inside user provider
  // returns methods to communicate with wallet and get data about account
  // as well as tzkt sockets
  const { connect, signOut, changeUser } = useUserApi({
    DAPP_INSTANCE: dapp,
    setUserLoading,
    setUserCtxState,
  });

  // Listening for active account changes with beacon
  useEffect(() => {
    if (IS_WEB && dapp) {
      (async function () {
        try {
          dapp.listenToActiveAccount(setAccount);
        } catch (err) {
          console.log(err);
        }
      })();
    }
  }, [IS_WEB, dapp]);

  useEffect(() => {
    if (account?.address) {
      (async function () {
        await loadInitialTzktTokensForNewlyConnectedUser({
          userAddress: account.address,
          tokensMetadata,
          isUsingLoader: false,
        });
      })();
    }
  }, [account, loadInitialTzktTokensForNewlyConnectedUser, tokensMetadata]);

  // account is updated when we trigger wallet account connect | disconnect | change acc
  // whenever account is updated - we reconnect tzkt socket to have up-to-date data
  // useEffect(() => {
  //   if (IS_WEB && dapp) {
  //     if (account) {
  //       setUserLoading(false);
  //       console.log(account, getTzktSocket());
  //       updateTzktConnection(account.address);
  //     } else if (account === null) {
  //       (async function () {
  //         setUserLoading(false);
  //         const tzktSocket = getTzktSocket();
  //         await tzktSocket?.stop();

  //         setTzktSocket(null);
  //       })();
  //     }
  //   }
  // }, [
  //   IS_WEB,
  //   dapp,
  //   account,
  //   getTzktSocket,
  //   setTzktSocket,
  //   updateTzktConnection,
  // ]);

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
