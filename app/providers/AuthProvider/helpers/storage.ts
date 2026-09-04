import {
  getItemFromStorage,
  removeItemFromStorage,
  setItemInStorage,
} from "~/lib/utils/local-storage";
import { RwaAuthTokens } from "~/providers/AuthProvider/auth.provider.types";

export const RWA_API_ACCESS_TOKEN_STORAGE_KEY = "rwa_api_access_token";
export const RWA_API_REFRESH_TOKEN_STORAGE_KEY = "rwa_api_refresh_token";
export const RWA_API_LAST_CHALLENGE_STORAGE_KEY = "rwa_api_last_challenge";
export const RWA_API_LAST_NONCE_STORAGE_KEY = "rwa_api_last_nonce";
export const RWA_API_LAST_CHALLENGE_EXPIRES_AT_STORAGE_KEY =
  "rwa_api_last_challenge_expires_at";

export async function getAuthTokensFromStorage(): Promise<RwaAuthTokens> {
  const accessToken = getItemFromStorage<string>(RWA_API_ACCESS_TOKEN_STORAGE_KEY);
  const refreshToken = getItemFromStorage<string>(
    RWA_API_REFRESH_TOKEN_STORAGE_KEY
  );

  return { accessToken, refreshToken };
}

export function setAuthTokensToStorage(tokens: RwaAuthTokens) {
  if (tokens.accessToken !== undefined) {
    setItemInStorage(
      RWA_API_ACCESS_TOKEN_STORAGE_KEY,
      tokens.accessToken ?? null
    );
  }

  if (tokens.refreshToken !== undefined) {
    setItemInStorage(
      RWA_API_REFRESH_TOKEN_STORAGE_KEY,
      tokens.refreshToken ?? null
    );
  }
}

export async function clearAuthTokensFromStorage() {
  removeItemFromStorage(RWA_API_ACCESS_TOKEN_STORAGE_KEY);
  removeItemFromStorage(RWA_API_REFRESH_TOKEN_STORAGE_KEY);
}

export function getLastNonceFromStorage(): string | null {
  return getItemFromStorage<string>(RWA_API_LAST_NONCE_STORAGE_KEY);
}

export async function setLastChallengeToStorage(params: {
  challenge: string | null;
  nonce?: string | null;
  expiresAt?: string | null;
}) {
  setItemInStorage(RWA_API_LAST_CHALLENGE_STORAGE_KEY, params.challenge);

  if (params.nonce !== undefined) {
    setItemInStorage(RWA_API_LAST_NONCE_STORAGE_KEY, params.nonce ?? null);
  }

  if (params.expiresAt !== undefined) {
    setItemInStorage(
      RWA_API_LAST_CHALLENGE_EXPIRES_AT_STORAGE_KEY,
      params.expiresAt ?? null
    );
  }
}
