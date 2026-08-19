import { z } from "zod";

const QuoteTokenSchema = z.object({
  address: z.string(),
  price_per_token: z.number(),
  total: z.number(),
});

const HistoryItemBaseSchema = z.object({
  id: z.string(),
  datetime: z.string(),
  type: z.string(),
  token_address: z.string(),
  operation_hash: z.string(),
  amount: z.number(),
  currency: z.string(),
  price_per_token: z.number(),
  total: z.number(),
});

export const OpenOrderItemSchema = z.object({
  id: z.string(),
  order_id: z.string(),
  operation_hash: z.string(),
  side: z.string(),
  token_address: z.string(),
  orderbook_address: z.string(),
  amount: z.number(),
  filled_amount: z.number(),
  remaining_amount: z.number(),
  filled_percent: z.number(),
  quote_token: QuoteTokenSchema,
  currency: z.string(),
  price_per_token: z.number(),
  total: z.number(),
  created_at: z.string(),
  expires_at: z.string().nullable(),
  expires_in_seconds: z.number().int().nullable(),
  can_cancel: z.boolean(),
});

export const OpenOrdersSchema = z.object({
  items: z.array(OpenOrderItemSchema),
  next_cursor: z.string().nullable().optional(),
  has_more: z.boolean(),
});

export const OrderHistoryItemSchema = HistoryItemBaseSchema.extend({
  status: z.string(),
  orderbook_address: z.string(),
  quote_token: QuoteTokenSchema,
});

export const OrderHistorySchema = z.object({
  items: z.array(OrderHistoryItemSchema),
  next_cursor: z.string().nullable().optional(),
  has_more: z.boolean(),
});

export const TransferHistoryItemSchema = HistoryItemBaseSchema.extend({
  status: z.string().optional(),
});

export const TransferHistorySchema = z.object({
  items: z.array(TransferHistoryItemSchema),
  next_cursor: z.string().nullable().optional(),
  has_more: z.boolean(),
});
