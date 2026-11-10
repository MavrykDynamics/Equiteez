import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
import { getSessionSyncAction } from "./helpers/sessionSync";
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
  const wallet = useWalletContext();
  const {
    identity: walletIdentity,
    isLoading: isWalletLoading,
    phase: walletPhase,
  } = wallet;
  const { IS_WEB } = useAppContext();
  const { tokensMetadata } = useTokensContext();

  const [userCtxState, setUserCtxState] =
    useState<UserContextStateType>(DEFAULT_USER);
  const [userTzktTokens, setUserTzktTokens] = useState<UserTzKtTokenBalances>(
    DEFAULT_USER_TZKT_TOKENS
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [tzktBalancesLoading, setIsTzktBalancesLoading] = useState(false);
  const [isUserLoading, setUserLoading] = useState(true);
  // The connected wallet's mv1 (Mavryk Wallet or email wallet)
  const accountAddress = walletIdentity?.address ?? null;
  const {
    authenticatedWalletAddress,
    logout,
    login,
    isAuthenticated,
    isAuthLoading,
  } = useAuthContext();
  const authenticatedUserAddress =
    isAuthenticated && authenticatedWalletAddress
      ? authenticatedWalletAddress
      : null;
  // connect → login or an account switch is running: the wallet may already
  // be connected while the RWA session is not there yet
  const [isAuthFlowActive, setIsAuthFlowActive] = useState(false);
  const authFlowCountRef = useRef(0);

  const runAuthFlow = useCallback(async (flow: () => Promise<void>) => {
    authFlowCountRef.current += 1;
    setIsAuthFlowActive(true);

    try {
      await flow();
    } finally {
      authFlowCountRef.current -= 1;
      if (authFlowCountRef.current === 0) setIsAuthFlowActive(false);
    }
  }, []);

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
    userAddress: authenticatedUserAddress,
  });

  // user hook used ONLY inside user provider
  // returns methods to communicate with wallet and get data about account
  // as well as tzkt sockets
  const { connect, signOut, changeUser } = useUserApi({
    wallet,
    setUserLoading,
    setUserCtxState,
    tzktSocket,
    setTzktSocket,
  });
  const switchAccount = useCallback(
    () =>
      runAuthFlow(async () => {
        await changeUser();
        await login();
      }),
    [changeUser, login, runAuthFlow]
  );

  const connectAndLogin = useCallback(
    () =>
      runAuthFlow(async () => {
        await connect();
        await login();
      }),
    [connect, login, runAuthFlow]
  );

  /**
   * Connects with `connectWallet` (e.g. the email wallet's code check), then
   * signs in to RWA with the connected wallet. A step that returns false did
   * not connect (e.g. an email is needed first): no sign-in then.
   */
  const connectWithWallet = useCallback(
    (connectWallet: () => Promise<unknown>) =>
      runAuthFlow(async () => {
        if ((await connectWallet()) === false) return;
        await login();
      }),
    [login, runAuthFlow]
  );

  /**
   * Signs out of the wallet and RWA. The Sign out button ends the Dynamic
   * session too; switching wallets keeps it (keepProviderSession).
   */
  const disconnectAndLogout = useCallback(
    async (options: { keepProviderSession?: boolean } = {}) => {
      await signOut(options);
      await logout();
    },
    [logout, signOut]
  );

  // The wallet provider restores the previous session on load
  useEffect(() => {
    setUserLoading(isWalletLoading);
  }, [isWalletLoading]);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!authenticatedUserAddress) {
      setUserCtxState(DEFAULT_USER);
      setUserTzktTokens(DEFAULT_USER_TZKT_TOKENS);
      return;
    }

    setUserCtxState((prev) => {
      if (prev.userAddress === authenticatedUserAddress) return prev;

      return {
        ...prev,
        userAddress: authenticatedUserAddress,
        isAdmin: ADMIN_ADDRESSES[authenticatedUserAddress],
        isKyced: false,
        hasOrders: false,
        userTokensBalances: {},
      };
    });

    setUserTzktTokens((prev) =>
      prev.userAddress === authenticatedUserAddress
        ? prev
        : DEFAULT_USER_TZKT_TOKENS
    );
  }, [authenticatedUserAddress, isAuthLoading]);

  useEffect(() => {
    if (authenticatedUserAddress) {
      (async function () {
        await loadInitialTzktTokensForNewlyConnectedUser({
          userAddress: authenticatedUserAddress,
          tokensMetadata,
          isUsingLoader: false,
        });
      })();
    }
  }, [
    authenticatedUserAddress,
    loadInitialTzktTokensForNewlyConnectedUser,
    tokensMetadata,
  ]);

  const {
    data: userAccountStatusData,
    loading: isUserAccountStatusLoading,
    error: userAccountStatusError,
    refetch: refetchUserAccountStatusQuery,
  } = useQuery(USER_ACCOUNT_STATUS_QUERY, {
    variables: { address: authenticatedUserAddress ?? "" },
    skip: !authenticatedUserAddress,
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (userAccountStatusError)
      console.log(userAccountStatusError, "USER_ACCOUNT_STATUS_QUERY");
  }, [userAccountStatusError]);

  const updateUserAccountStatus = useCallback(
    (data: UserAccountStatusQuery | undefined) => {
      if (!authenticatedUserAddress || !data) return;

      const isKyced = getIsKycedForAddress(data, authenticatedUserAddress);
      const hasOrders = getHasOrdersForAddress(data, authenticatedUserAddress);

      setUserCtxState((prev) => {
        if (
          prev.userAddress !== authenticatedUserAddress ||
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
    [authenticatedUserAddress]
  );

  const refetchUserAccountStatus = useCallback(async () => {
    if (!authenticatedUserAddress) return;

    const { data } = await refetchUserAccountStatusQuery({
      address: authenticatedUserAddress,
    });

    updateUserAccountStatus(data);
  }, [
    authenticatedUserAddress,
    refetchUserAccountStatusQuery,
    updateUserAccountStatus,
  ]);

  useEffect(() => {
    updateUserAccountStatus(userAccountStatusData);
  }, [updateUserAccountStatus, userAccountStatusData]);

  useEffect(() => {
    if (!IS_WEB) return;

    // The RWA session ended (expired or signed out in another tab): drop the
    // wallet here but keep the Dynamic session, so signing in needs no code
    const onAuthExpired = () => {
      void signOut({ keepProviderSession: true });
    };

    window.addEventListener(AUTH_EXPIRED_EVENT, onAuthExpired);

    return () => {
      window.removeEventListener(AUTH_EXPIRED_EVENT, onAuthExpired);
    };
  }, [IS_WEB, signOut]);

  const sessionSyncAction = getSessionSyncAction({
    isWeb: IS_WEB,
    isAuthLoading,
    isAuthenticated,
    isAuthFlowActive,
    isWalletBusy: walletPhase === "restoring" || walletPhase === "connecting",
    accountAddress,
    authenticatedWalletAddress,
  });

  useEffect(() => {
    if (sessionSyncAction === "disconnect-wallet") {
      void signOut({ keepProviderSession: true });
    } else if (sessionSyncAction === "logout-rwa") {
      void logout();
    }
  }, [logout, sessionSyncAction, signOut]);

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
      connectWithWallet,
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
    connectWithWallet,
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
