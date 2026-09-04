import { z } from "zod";

export const AuthChallengeResponseSchema = z.object({
  challenge: z.string(),
  expiresAt: z.string(),
  nonce: z.string(),
});

export const AuthVerifyResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export const AuthRefreshResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});
