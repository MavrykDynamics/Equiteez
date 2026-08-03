import { z } from "zod";

const CurrencyAmountSchema = z.object({
  timestamp: z.string(),
  usd: z.number(),
  eur: z.number(),
  btc: z.number(),
  eth: z.number(),
  jpy: z.number(),
  cny: z.number(),
  krw: z.number(),
  gbp: z.number(),
  rub: z.number(),
  aed: z.number(),
});

const QuotePriceSchema = z.object({
  value: z.number(),
  currency: z.string(),
});

const AssetHighlightsChangeSchema = z.object({
  pct: z.number(),
  abs: z.number(),
  currency: z.string(),
});

const TokenMetadataSchema = z.object({
  icon: z.string().optional(),
  name: z.string(),
  symbol: z.string(),
  decimals: z.number(),
});

const QuoteTokenSchema = z.object({
  address: z.string(),
  token_id: z.number(),
  symbol: z.string(),
  decimals: z.number(),
});

const OrderbookSchema = z.object({
  address: z.string(),
  quote_token: QuoteTokenSchema,
  buy_order_fee: z.number(),
  sell_order_fee: z.number(),
  updated_at: z.string(),
});

const AssetProfileSchema = z.object({
  description: z.string(),
  asset_type: z.string(),
  status: z.string(),
  lifecycle: z.string(),
  image_url: z.string().optional(),
});

const AssetFinanceSchema = z.object({
  value_per_token: z.number(),
  total_dividends_distributed: z.string(),
  max_supply: z.string(),
  mintable: z.boolean().optional(),
  decimals: z.number(),
});

const AssetContractSchema = z.object({
  type: z.string(),
  address: z.string(),
  status: z.string(),
  trading_pair: z.string(),
  trading_pair_address: z.string(),
  tokens_sold: z.string(),
  min_purchase_amount: z.number(),
  deployed_at: z.string(),
});

const AssetAthSchema = z.object({
  price: CurrencyAmountSchema,
  date: z.string(),
});

const AssetStatsSchema = z.object({
  symbol: z.string(),
  price: CurrencyAmountSchema,
  volume_24h: CurrencyAmountSchema.optional(),
  market_cap: CurrencyAmountSchema,
  fdv: CurrencyAmountSchema,
  total_supply: z.string(),
  circulating_supply: z.string(),
  ath: AssetAthSchema.optional(),
  avg_hold_time_days: z.number(),
  updated_at: z.number(),
});

export const AssetSchema = z.object({
  address: z.string(),
  metadata: TokenMetadataSchema,
  total_supply: z.string(),
  holders_count: z.number(),
  market_type: z.string(),
  category: z.string(),
  apy: z.number(),
  orderbook: OrderbookSchema.optional(),
  profile: AssetProfileSchema,
  finance: AssetFinanceSchema,
  contracts: z.array(AssetContractSchema),
  created_at: z.string().optional(),
  updated_at: z.string(),
  stats: AssetStatsSchema.optional(),
  launch_status: z.string().optional(),
  has_active_launch: z.boolean().optional(),
});

export const AssetsSchema = z.object({
  items: z.array(AssetSchema),
});

const AssetHighlightSchema = z.object({
  address: z.string(),
  symbol: z.string(),
  name: z.string(),
  icon: z.string().optional(),
  market_type: z.string(),
  price: CurrencyAmountSchema,
  quote_price: QuotePriceSchema,
  change_24h: AssetHighlightsChangeSchema.nullable(),
  volume_24h: CurrencyAmountSchema.optional(),
  listed_at: z.string(),
});

export const AssetsHighlightsSchema = z.object({
  as_of: z.string(),
  top_gainers: z.array(AssetHighlightSchema),
  trending: z.array(AssetHighlightSchema),
  newly_added: z.array(AssetHighlightSchema),
});
