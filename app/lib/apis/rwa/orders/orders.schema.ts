import { z } from "zod";

const QuoteTokenSchema = z.object({
  address: z.string(),
  price_per_token: z.number().nullable(),
  total: z.number().nullable(),
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

const PaginationSchema = z.object({
  page: z.number(),
  per_page: z.number(),
  total: z.number(),
  total_pages: z.number(),
  truncated: z.boolean(),
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
  price_per_token: z.number().nullable(),
  total: z.number().nullable(),
  created_at: z.string(),
  expires_at: z.string().nullable(),
  expires_in_seconds: z.number().int().nullable(),
  can_cancel: z.boolean(),
});

export const OpenOrdersSchema = PaginationSchema.extend({
  items: z.array(OpenOrderItemSchema),
});

export const OrderHistoryItemSchema = HistoryItemBaseSchema.extend({
  status: z.string(),
  orderbook_address: z.string(),
  quote_token: QuoteTokenSchema,
});

export const OrderHistorySchema = PaginationSchema.extend({
  items: z.array(OrderHistoryItemSchema),
});

export const TransferHistoryItemSchema = HistoryItemBaseSchema.extend({
  price_per_token: z.number().nullable(),
  status: z.string().optional(),
  total: z.number().nullable(),
  chain_from: z.string(),
  chain_to: z.string(),
  from: z.string().optional(),
  to: z.string().optional(),
});

export const TransferHistorySchema = PaginationSchema.extend({
  items: z.array(TransferHistoryItemSchema),
});
