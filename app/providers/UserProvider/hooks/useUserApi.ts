import { useCallback, useMemo } from "react";

// consts
import { DEFAULT_USER } from "../helpers/user.consts";

// types
import { UserContextStateType } from "../user.provider.types";

import type { WalletContextValue } from "~/providers/WalletProvider/wallet.types";
import { HubConnection } from "@microsoft/signalr";

type UseUserApiType = {
  wallet: Pick<
    WalletContextValue,
    "connectMavrykWallet" | "disconnect" | "getIdentity"
  >;
  // setters for loadings in user provider
  setUserLoading: (newLoading: boolean) => void;

  // setters for user data in user provider
  setUserCtxState: React.Dispatch<React.SetStateAction<UserContextStateType>>;
  tzktSocket: HubConnection | null;
  setTzktSocket: (socket: HubConnection | null) => void;
};

/**
 * hook to handle CRUD with user (connect, changeWallet, signOut)
 * SHOULD BE USED ONLY IN UserProvider
 */
export const useUserApi = ({
  wallet,
  setUserLoading,
  setUserCtxState,
  tzktSocket,
  setTzktSocket,
}: UseUserApiType) => {
  const { connectMavrykWallet, disconnect, getIdentity } = wallet;

  /**
   * connect user's wallet to DAPP:
   * load tzkt balances and set user's address to ctx (inside loadInitialTzktTokensForNewlyConnectedUser) to make QueryWithRefetch work
   */
  const connect = useCallback(async () => {
    try {
      await connectMavrykWallet();
    } catch (e) {
      console.error(`Failed to connect wallet:`, e);
    }
  }, [connectMavrykWallet]);

  /**
   * Mavryk Wallet: pick another account in the extension.
   * Email wallet: sign out of this account but keep the Dynamic session, so
   * the user can sign in with either wallet again.
   */
  const changeUser = useCallback(async () => {
    try {
      if (getIdentity()?.provider === "dynamic") {
        await disconnect({ keepProviderSession: true });
        return;
      }

      await connectMavrykWallet();
    } catch (e) {
      console.error(`Failed to change wallet: `, e);
    }
  }, [connectMavrykWallet, disconnect, getIdentity]);

  /**
   * disconnect user's wallet to DAPP & set context to no user state
   */
  const signOut = useCallback(async () => {
    try {
      await tzktSocket?.stop();
      setTzktSocket(null);

      await disconnect();

      setUserCtxState(DEFAULT_USER);
      setUserLoading(false);
    } catch (e) {
      console.error(`Failed to disconnect wallet: `, e);
    }
  }, [disconnect, setTzktSocket, setUserCtxState, setUserLoading, tzktSocket]);

  const returnValue = useMemo(
    () => ({
      connect,
      signOut,
      changeUser,
    }),
    [connect, signOut, changeUser]
  );

  return returnValue;
};
