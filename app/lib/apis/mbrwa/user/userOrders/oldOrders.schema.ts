import { z } from "zod";

export const OrderSchema = z.object({
  id: z.number(),
  orderbook: z.object({
    rwa_token: z.object({
      address: z.string(),
    }),
  }),
  is_canceled: z.boolean(),
  is_expired: z.boolean(),
  is_fulfilled: z.boolean(),
  is_refunded: z.boolean(),
  order_expiry: z.string().nullable(),
  order_id: z.number(),
  order_type: z.number(),
  created_at: z.string(),
  fulfilled_amount: z.number(),
  orderbook_id: z.number(),
  price_per_rwa_token: z.number(),
  refunded_amount: z.number(),
  rwa_token_amount: z.number(),
  total_paid_out: z.number(),
  total_usd_value_of_rwa_token_amount: z.number(),
  unfulfilled_amount: z.number(),
});

export const OrdersListSchema = z.object({
  orderbook_order: z.array(OrderSchema),
  orderbook_order_aggregate: z.object({
    aggregate: z.object({
      count: z.number(),
    }),
  }),
});

export type OrderType = z.infer<typeof OrderSchema>;

