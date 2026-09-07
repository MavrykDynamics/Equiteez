import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// consts
import {
  ADMIN_ADDRESSES,
  DEFAULT_USER,
  DEFAULT_USER_TZKT_TOKENS,
} from "./helpers/user.consts";

// hooks
import { useUserApi } from "./hooks/useUserApi";

import {
  UserContext,
  UserContextStateType,
  UserTzKtTokenBalances,
} from "./user.provider.types";
import { useWalletContext } from "../WalletProvider/wallet.provider";
import { useAppContext } from "../AppProvider/AppProvider";
import type { AccountInfo } from "@mavrykdynamics/beacon-dapp";
import { useUserSockets } from "./helpers/sockets";
import { useTokensContext } from "../TokensProvider/tokens.provider";
import { useQuery } from "@apollo/client/index";
import { USER_ACCOUNT_STATUS_QUERY } from "./queries/user.query";
import { useAuthContext } from "~/providers/AuthProvider/auth.provider";
import { AUTH_EXPIRED_EVENT } from "~/providers/AuthProvider/helpers/auth.events";
import {
  getHasOrdersForAddress,
  getIsKycedForAddress,
} from "./helpers/userStatus.helpers";
import type { UserAccountStatusQuery } from "~/utils/__generated__/graphql";

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
  const [tzktBalancesLoading, setIsTzktBalancesLoading] = useState(false);
  const [isUserLoading, setUserLoading] = useState(true);
  const accountAddress = account?.address ?? null;

  // open socket for tzkt without listeners, cuz don't have user address to subscribe

  // handle user sockets connection | updates | disconnect
  const {
    loadInitialTzktTokensForNewlyConnectedUser,
    tzktSocket,
    setTzktSocket,
  } = useUserSockets({
    setIsTzktBalancesLoading,
    setUserCtxState,
    setUserTzktTokens,
    account,
  });

  // user hook used ONLY inside user provider
  // returns methods to communicate with wallet and get data about account
  // as well as tzkt sockets
  const { connect, signOut, changeUser } = useUserApi({
    DAPP_INSTANCE: dapp,
    setUserLoading,
    setUserCtxState,
    tzktSocket,
    setTzktSocket,
  });
  const { logout, login, isAuthenticated, isAuthLoading } = useAuthContext();

  const switchAccount = useCallback(async () => {
    await changeUser();
    await login();
  }, [changeUser, login]);

  const connectAndLogin = useCallback(async () => {
    await connect();
    await login();
  }, [connect, login]);

  const disconnectAndLogout = useCallback(async () => {
    await signOut();
    await logout();
  }, [logout, signOut]);

  // Listening for active account changes with beacon
  useEffect(() => {
    if (IS_WEB && dapp) {
      let isMounted = true;

      (async function () {
        try {
          await dapp.listenToActiveAccount((activeAccount) => {
            if (isMounted) setAccount(activeAccount);
          });
        } catch (err) {
          console.log(err);
        } finally {
          if (isMounted) setUserLoading(false);
        }
      })();

      return () => {
        isMounted = false;
      };
    }
  }, [IS_WEB, dapp]);

  useEffect(() => {
    if (account === undefined) return;

    if (!accountAddress) {
      setUserCtxState(DEFAULT_USER);
      setUserTzktTokens(DEFAULT_USER_TZKT_TOKENS);
      return;
    }

    setUserCtxState((prev) => {
      if (prev.userAddress === accountAddress) return prev;

      return {
        ...prev,
        userAddress: accountAddress,
        isAdmin: ADMIN_ADDRESSES[accountAddress],
        isKyced: false,
        hasOrders: false,
        userTokensBalances: {},
      };
    });

    setUserTzktTokens((prev) =>
      prev.userAddress === accountAddress ? prev : DEFAULT_USER_TZKT_TOKENS
    );
  }, [account, accountAddress]);

  useEffect(() => {
    if (accountAddress) {
      (async function () {
        await loadInitialTzktTokensForNewlyConnectedUser({
          userAddress: accountAddress,
          tokensMetadata,
          isUsingLoader: false,
        });
      })();
    }
  }, [
    accountAddress,
    loadInitialTzktTokensForNewlyConnectedUser,
    tokensMetadata,
  ]);

  const {
    data: userAccountStatusData,
    loading: isUserAccountStatusLoading,
    error: userAccountStatusError,
    refetch: refetchUserAccountStatusQuery,
  } = useQuery(USER_ACCOUNT_STATUS_QUERY, {
    variables: { address: accountAddress ?? "" },
    skip: !accountAddress,
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (userAccountStatusError)
      console.log(userAccountStatusError, "USER_ACCOUNT_STATUS_QUERY");
  }, [userAccountStatusError]);

  const updateUserAccountStatus = useCallback(
    (data: UserAccountStatusQuery | undefined) => {
      if (!accountAddress || !data) return;

      const isKyced = getIsKycedForAddress(data, accountAddress);
      const hasOrders = getHasOrdersForAddress(data, accountAddress);

      setUserCtxState((prev) => {
        if (
          prev.userAddress !== accountAddress ||
          (prev.isKyced === isKyced && prev.hasOrders === hasOrders)
        )
          return prev;

        return {
          ...prev,
          isKyced,
          hasOrders,
        };
      });
    },
    [accountAddress]
  );

  const refetchUserAccountStatus = useCallback(async () => {
    if (!accountAddress) return;

    const { data } = await refetchUserAccountStatusQuery({
      address: accountAddress,
    });

    updateUserAccountStatus(data);
  }, [
    accountAddress,
    refetchUserAccountStatusQuery,
    updateUserAccountStatus,
  ]);

  useEffect(() => {
    updateUserAccountStatus(userAccountStatusData);
  }, [updateUserAccountStatus, userAccountStatusData]);

  useEffect(() => {
    if (!IS_WEB) return;

    const onAuthExpired = () => {
      void signOut();
    };

    window.addEventListener(AUTH_EXPIRED_EVENT, onAuthExpired);

    return () => {
      window.removeEventListener(AUTH_EXPIRED_EVENT, onAuthExpired);
    };
  }, [IS_WEB, signOut]);

  useEffect(() => {
    if (!IS_WEB || isAuthLoading || isAuthenticated) return;
    if (!accountAddress) return;

    void signOut();
  }, [IS_WEB, accountAddress, isAuthenticated, isAuthLoading, signOut]);

  const providerValue = useMemo(() => {
    const isLoading =
      isUserLoading || tzktBalancesLoading || isUserAccountStatusLoading;

    return {
      ...userCtxState,
      userTokensBalances: {
        ...userCtxState.userTokensBalances,
        ...(userCtxState.userAddress === userTzktTokens.userAddress
          ? userTzktTokens.tokens
          : {}),
      },
      isLoading,
      connect: connectAndLogin,
      refetchUserAccountStatus,
      signOut: disconnectAndLogout,
      changeUser: switchAccount,
    };
  }, [
    isUserLoading,
    tzktBalancesLoading,
    isUserAccountStatusLoading,
    userCtxState,
    userTzktTokens.userAddress,
    userTzktTokens.tokens,
    connectAndLogin,
    refetchUserAccountStatus,
    disconnectAndLogout,
    switchAccount,
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
    throw new Error("userContext should be used within UserProvider");
  }

  return context;
};

export default UserProvider;
