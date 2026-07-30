import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useWalletContext } from "../WalletProvider/wallet.provider";
import { useAppContext } from "../AppProvider/AppProvider";
import {
  AuthChallengeRequest,
  AuthChallengeResponse,
  AuthContext,
  AuthRefreshRequest,
  AuthVerifyRequest,
  AuthVerifyResponse,
} from "~/providers/AuthProvider/auth.provider.types";
import { signAuthChallenge } from "~/providers/AuthProvider/helpers/utils";
import { rwaApi } from "~/lib/apis/rwa/client";
import {
  getAuthTokensFromStorage,
  getLastNonceFromStorage,
  setAuthTokensToStorage,
  setLastChallengeToStorage,
} from "~/providers/AuthProvider/helpers/storage";
import {
  AuthChallengeResponseSchema,
  AuthVerifyResponseSchema,
} from "~/providers/AuthProvider/helpers/auth.schema";
import {
  AUTH_EXPIRED_EVENT,
  emitAuthExpiredEvent,
} from "~/providers/AuthProvider/helpers/auth.events";
import {
  AUTH_LOGOUT_EVENT,
  AUTH_TOKENS_UPDATED_EVENT,
  emitAuthSyncEvent,
  subscribeToAuthSyncEvents,
} from "~/providers/AuthProvider/helpers/auth-sync.helpers";
import { clearAuthSession } from "~/providers/AuthProvider/helpers/auth.service";

export const authContext = React.createContext<AuthContext>(undefined!);

type Props = {
  children: React.ReactNode;
};

export const AuthProvider = ({ children }: Props) => {
  const { dapp } = useWalletContext();
  const { IS_WEB } = useAppContext();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { accessToken, refreshToken } = await getAuthTokensFromStorage();
      setIsAuthenticated(Boolean(accessToken || refreshToken));
      setIsAuthLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!IS_WEB) return;

    const onAuthExpired = () => {
      setIsAuthenticated(false);
      setIsAuthLoading(false);
    };

    window.addEventListener(AUTH_EXPIRED_EVENT, onAuthExpired);

    return () => {
      window.removeEventListener(AUTH_EXPIRED_EVENT, onAuthExpired);
    };
  }, [IS_WEB]);

  useEffect(() => {
    if (!IS_WEB) return;

    return subscribeToAuthSyncEvents(async (type) => {
      const { accessToken, refreshToken } = await getAuthTokensFromStorage();
      const nextAuthenticated = Boolean(accessToken || refreshToken);

      setIsAuthenticated(nextAuthenticated);
      setIsAuthLoading(false);

      if (type === AUTH_LOGOUT_EVENT || !nextAuthenticated) {
        emitAuthExpiredEvent();
      }
    });
  }, [IS_WEB]);

  const requestAuthChallenge = useCallback(
    async (params: AuthChallengeRequest) => {
      const { data } = await rwaApi.post<AuthChallengeResponse>(
        "/auth/challenge",
        {
          walletAddress: params.walletAddress,
        }
      );

      const parsed = AuthChallengeResponseSchema.parse(data);
      await setLastChallengeToStorage({
        challenge: parsed.challenge,
        nonce: parsed.nonce,
        expiresAt: parsed.expiresAt,
      });

      return parsed;
    },
    []
  );

  const verifyAuthSignature = useCallback(async (payload: AuthVerifyRequest) => {
    const nonce = payload.nonce ?? (await getLastNonceFromStorage()) ?? undefined;

    const { data } = await rwaApi.post<AuthVerifyResponse>("/auth/verify", {
      walletAddress: payload.walletAddress,
      publicKey: payload.publicKey,
      nonce,
      signature: payload.signature,
      format: payload.format ?? "micheline_string",
      walletProvider: payload.walletProvider ?? "mavryk_extension",
      deviceInfo: payload.deviceInfo,
    });

    const parsed = AuthVerifyResponseSchema.parse(data);

    await setAuthTokensToStorage({
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
    });
    emitAuthSyncEvent(AUTH_TOKENS_UPDATED_EVENT);

    return parsed;
  }, []);

  const logout = useCallback(async (params: AuthRefreshRequest = {}) => {
    const { refreshToken: storedRefreshToken } = await getAuthTokensFromStorage();
    const refreshToken = params.refreshToken ?? storedRefreshToken;

    try {
      await rwaApi.post("/auth/logout", { refreshToken });
    } finally {
      await clearAuthSession();
      setIsAuthenticated(false);
      setIsAuthLoading(false);
      emitAuthExpiredEvent();
    }
  }, []);

  const login = useCallback(async () => {
    setIsAuthLoading(true);

    try {
      if (IS_WEB && dapp) {
        const activeAccount = await dapp.getDAppClient().getActiveAccount();

        if (!activeAccount?.address) {
          setIsAuthenticated(false);
          return;
        }

        const { nonce, challenge } = await requestAuthChallenge({
          walletAddress: activeAccount.address,
        });
        const signedChallenge = await signAuthChallenge(challenge);

        await verifyAuthSignature({
          nonce,
          signature: signedChallenge.signature,
          publicKey: signedChallenge.publicKey,
          format: signedChallenge.format,
          walletAddress: activeAccount.address,
          walletProvider: signedChallenge.walletProvider,
        });
        setIsAuthenticated(true);
        return;
      }

      setIsAuthenticated(false);
    } catch (error) {
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsAuthLoading(false);
    }
  }, [IS_WEB, dapp, requestAuthChallenge, verifyAuthSignature]);

  const providerValue = useMemo(
    () => ({
      logout,
      login,
      isAuthenticated,
      isAuthLoading,
    }),
    [logout, login, isAuthenticated, isAuthLoading]
  );

  return (
    <authContext.Provider value={providerValue}>{children}</authContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(authContext);

  if (!context) {
    throw new Error("authContext should be used within AuthProvider");
  }

  return context;
};

export default AuthProvider;
