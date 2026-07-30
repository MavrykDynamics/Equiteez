import { z } from "zod";
import {
  AuthChallengeResponseSchema,
  AuthRefreshResponseSchema,
  AuthVerifyResponseSchema,
} from "~/providers/AuthProvider/helpers/auth.schema";

export type AuthChallengeResponse = z.infer<typeof AuthChallengeResponseSchema>;
export type AuthVerifyResponse = z.infer<typeof AuthVerifyResponseSchema>;
export type AuthRefreshResponse = z.infer<typeof AuthRefreshResponseSchema>;

export type RwaAuthTokens = {
  accessToken?: string | null;
  refreshToken?: string | null;
};

export type AuthChallengeRequest = {
  walletAddress: string;
};

export type AuthVerifyRequest = {
  deviceInfo?: Record<string, unknown>;
  format?: "micheline_string";
  nonce?: string;
  signature: string;
  publicKey: string;
  walletAddress: string;
  walletProvider?: "mavryk_extension";
};

export type AuthRefreshRequest = {
  refreshToken?: string;
};

export type AuthContext = {
  logout: (params?: AuthRefreshRequest) => Promise<void>;
  login: () => Promise<void>;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
};
