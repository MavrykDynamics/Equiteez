import { z } from "zod";

import { AsOfSourceSchema } from "~/lib/apis/rwa/freshness/asOf.schema";

export const RefundOrderTypeSchema = z.enum(["BUY", "SELL"]);

export const RefundTokenSchema = z.object({
  token_address: z.string(),
  token_id: z.string(),
  amount_units: z.string(),
  decimals: z.number().nullable(),
  symbol: z.string().nullable(),
});

export const RefundItemSchema = z.object({
  orderbook_address: z.string(),
  order_id: z.string(),
  order_type: RefundOrderTypeSchema,
  refund: RefundTokenSchema.nullable(),
  availability: z.string(),
  blocked_reason: z.string().nullable(),
});

export const RefundsPageSchema = z.object({
  as_of: z.object({
    orderbook: AsOfSourceSchema,
  }),
  items: z.array(RefundItemSchema),
  next_cursor: z.string().nullable(),
  has_more: z.boolean(),
});
