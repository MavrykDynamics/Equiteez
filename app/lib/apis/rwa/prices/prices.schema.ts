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

const PrimaryIssuanceSchema = z.object({
  launch_id: z.number(),
  name: z.string(),
  status: z.string(),
  active: z.boolean(),
  price: z.number(),
  price_as_of: z.string(),
  total_bought: z.string(),
  max_amount_cap: z.string(),
  progress_percent: z.number(),
  sale_start: z.string(),
  sale_end: z.string(),
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
  primary_issuance: PrimaryIssuanceSchema.optional(),
  quote: z.string(),
  series_1d: PriceSeriesSchema,
  symbol: z.string(),
  token_address: z.string(),
  usd: z.number().optional(),
});

export const PricesSchema = z.object({
  assets: z.array(PriceAssetSchema),
});
