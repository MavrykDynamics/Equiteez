import {
  AuthRefreshRequest,
  AuthRefreshResponse,
} from "~/providers/AuthProvider/auth.provider.types";
import {
  clearAuthTokensFromStorage,
  getAuthTokensFromStorage,
  setAuthTokensToStorage,
} from "~/providers/AuthProvider/helpers/storage";
import { rwaApi, refreshUrl } from "~/lib/apis/rwa/client";
import { AuthRefreshResponseSchema } from "~/providers/AuthProvider/helpers/auth.schema";
import { emitAuthExpiredEvent } from "~/providers/AuthProvider/helpers/auth.events";
import {
  AUTH_LOGOUT_EVENT,
  AUTH_TOKENS_UPDATED_EVENT,
  emitAuthSyncEvent,
} from "~/providers/AuthProvider/helpers/auth-sync.helpers";

let refreshPromise: Promise<string> | null = null;

async function clearTokensAndExpireSession() {
  await clearAuthTokensFromStorage();
  emitAuthSyncEvent(AUTH_LOGOUT_EVENT);
  emitAuthExpiredEvent();
}

export async function clearAuthSession() {
  await clearAuthTokensFromStorage();
  emitAuthSyncEvent(AUTH_LOGOUT_EVENT);
}

export async function refreshAuthTokens(params: AuthRefreshRequest = {}) {
  const { refreshToken: storedRefreshToken } = await getAuthTokensFromStorage();
  const refreshToken = params.refreshToken ?? storedRefreshToken;

  if (!refreshToken) {
    await clearTokensAndExpireSession();
    throw new Error("No refresh token in storage");
  }

  try {
    const { data } = await rwaApi.post<AuthRefreshResponse>(refreshUrl, {
      refreshToken,
    });

    const parsed = AuthRefreshResponseSchema.parse(data);
    await setAuthTokensToStorage({
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
    });
    emitAuthSyncEvent(AUTH_TOKENS_UPDATED_EVENT);

    return parsed;
  } catch (error) {
    await clearTokensAndExpireSession();
    throw error;
  }
}

export class AuthService {
  static async refreshAccessToken(): Promise<string> {
    if (!refreshPromise) {
      refreshPromise = refreshAuthTokens()
        .then((response) => response.accessToken)
        .finally(() => {
          refreshPromise = null;
        });
    }

    return refreshPromise;
  }
}
