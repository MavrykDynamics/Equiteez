import { z } from "zod";

const QuoteTokenSchema = z.object({
  address: z.string(),
  price_per_token: z.number(),
  total: z.number(),
});

export const OpenOrderItemSchema = z.object({
  id: z.string(),
  operation_hash: z.string(),
  side: z.string(),
  token_address: z.string(),
  orderbook_address: z.string(),
  amount: z.number(),
  quote_token: QuoteTokenSchema,
  currency: z.string(),
  price_per_token: z.number(),
  total: z.number(),
  created_at: z.string(),
  can_cancel: z.boolean(),
});

export const OpenOrdersSchema = z.object({
  items: z.array(OpenOrderItemSchema),
  next_cursor: z.string().nullable().optional(),
  has_more: z.boolean(),
});

export const OrderHistoryItemSchema = z.object({
  id: z.string(),
  datetime: z.string(),
  type: z.string(),
  status: z.string(),
  token_address: z.string(),
  operation_hash: z.string(),
  orderbook_address: z.string(),
  amount: z.number(),
  quote_token: QuoteTokenSchema,
  currency: z.string(),
  price_per_token: z.number(),
  total: z.number(),
});

export const OrderHistorySchema = z.object({
  items: z.array(OrderHistoryItemSchema),
  next_cursor: z.string().nullable().optional(),
  has_more: z.boolean(),
});
