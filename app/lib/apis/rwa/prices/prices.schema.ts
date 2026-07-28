import { z } from "zod";

const PriceChangeSchema = z.object({
  delta_abs: z.number().nullable(),
  change_pct: z.number().nullable(),
});

const PriceSeriesPointSchema = z.object({
  p: z.number(),
  t: z.string(),
  usd: z.number(),
});

export const PriceSeriesSchema = z.object({
  interval: z.string(),
  points: z.array(PriceSeriesPointSchema),
});

export const AssetPriceSeriesSchema = z.object({
  symbol: z.string(),
  currency: z.string(),
  kind: z.literal("series"),
  interval: z.string(),
  points: z.array(PriceSeriesPointSchema),
});

export const PriceAssetSchema = z.object({
  base: z.string(),
  change_24h: PriceChangeSchema,
  native_quote: z.string(),
  price: z.number().nullable(),
  price_as_of: z.string().nullable(),
  quote: z.string(),
  series_1d: PriceSeriesSchema,
  symbol: z.string(),
  token_address: z.string(),
  usd: z.number().optional(),
});

export const PricesSchema = z.object({
  assets: z.array(PriceAssetSchema),
});
