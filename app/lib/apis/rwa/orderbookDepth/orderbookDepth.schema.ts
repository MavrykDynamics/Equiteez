import { z } from "zod";

const numericSchema = z.preprocess(
  (value) => (typeof value === "string" ? Number(value) : value),
  z.number().refine(Number.isFinite, "Expected a finite number")
);

const optionalNumericSchema = z
  .union([numericSchema, z.null(), z.undefined()])
  .transform((value) => value ?? 0);

const QuoteTokenSchema = z.object({
  address: z.string(),
  decimals: numericSchema,
  symbol: z.string(),
  token_id: numericSchema,
});

export const OrderbookDepthLevelSchema = z.object({
  amount: numericSchema,
  orders_count: numericSchema,
  price: numericSchema,
  total_quote: numericSchema,
});

export const OrderbookDepthSchema = z.object({
  asks: z.array(OrderbookDepthLevelSchema),
  best_ask: optionalNumericSchema,
  best_bid: optionalNumericSchema,
  bids: z.array(OrderbookDepthLevelSchema),
  generated_at: z.string(),
  orderbook_address: z.string(),
  quote_token: QuoteTokenSchema,
  spread: optionalNumericSchema,
  token_address: z.string(),
  totals: z.object({
    ask_volume: numericSchema,
    bid_volume: numericSchema,
    buy_ratio_pct: numericSchema,
    ratio_depth: numericSchema,
    sell_ratio_pct: numericSchema,
  }),
});
