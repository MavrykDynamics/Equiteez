import { z } from "zod";

const nullishNumberWithZeroFallback = z.preprocess(
  (value) => (value == null ? 0 : value),
  z.number()
);

export const AssetSchema = z.object({
  token: z.object({
    address: z.string(),
    name: z.string(),
    symbol: z.string(),
    icon: z.string().optional(),
    apy: z.number(),
  }),
  total_balance: z.number(),
  available_balance: z.number(),
  available_balance_usd: z.number(),
  price_change24h_percent: z.number(),
  token_price: nullishNumberWithZeroFallback,
  in_orders: z.number(),
  in_orders_usd: z.number(),
  total_balance_usd: z.number(),
});

export const AssetsListSchema = z.object({
  assets: z.array(AssetSchema),
});
