import { z } from "zod";
import { OrderTypes } from "~/lib/userOrders/order.const";

export const OrderSchema = z.object({
  id: z.number(),
  token: z.object({
    address: z.string(),
    name: z.string(),
    symbol: z.string(),
    icon: z.string().nullable(),
  }),
  order_type: z.nativeEnum(OrderTypes),
  created_at: z.string(),
  fulfilled_amount: z.number(),
  price_per_rwa_token: z.number(),
  rwa_token_amount: z.number(),
  total_paid_out: z.number(),
  total_usd_value_of_rwa_token_amount: z.number(),
  unfulfilled_amount: z.number(),
  refunded_amount: z.number(),
  order_id: z.number(),
});

export const OrdersListSchema = z.object({
  orders: z.array(OrderSchema),
  total_count: z.number(),
});
