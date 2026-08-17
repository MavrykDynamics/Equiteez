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

export const WalletPortfolioAssetSchema = z.object({
  token_address: z.string(),
  symbol: z.string(),
  name: z.string(),
  category: z.string(),
  balance: z.number(),
  value: z.number(),
  share_pct: z.number(),
  price: z.number(),
  avg_price: z.number().nullable(),
  profit: z.number().nullable(),
  profit_pct: z.number().nullable(),
  yield_pct: z.number().nullable(),
  price_change_30d_pct: z.number().nullable(),
});

export const WalletPortfolioSchema = z.object({
  currency: z.string(),
  total_value: z.number(),
  est_net_yield_pct: z.number().nullable(),
  assets: z.array(WalletPortfolioAssetSchema),
});

export const WalletPortfolioHistoryPointSchema = z.object({
  t: z.string(),
  value: z.number(),
});

export const WalletPortfolioHistorySchema = z.object({
  range: z.string(),
  currency: z.string(),
  points: z.array(WalletPortfolioHistoryPointSchema),
  change_abs: z.number().nullable(),
  change_pct: z.number().nullable(),
});
