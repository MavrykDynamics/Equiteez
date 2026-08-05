import { z } from "zod";

export const WalletTokenSchema = z.object({
  total_balance: z.number(),
  total_value: z.number(),
  price_per_token: z.number(),
});

export const WalletRwaAssetSchema = z.object({
  address: z.string(),
  total_balance: z.number(),
  in_orders: z.number(),
  available_balance: z.number(),
  total_value: z.number(),
  price_per_token: z.number(),
});

export const WalletSchema = z.object({
  is_kyc_approved: z.boolean(),
  currency: z.string(),
  account_value: z.number(),
  spot_balance: z.number(),
  tokens: z.record(WalletTokenSchema),
  rwa_assets: z.record(WalletRwaAssetSchema),
  pnl: z.number(),
  pnl_percentage: z.number(),
  pnl_24h: z.number().nullable(),
  pnl_7d: z.number().nullable(),
  pnl_30d: z.number().nullable(),
});
