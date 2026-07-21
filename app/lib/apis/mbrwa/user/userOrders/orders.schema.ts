import { z } from "zod";
import { OrderTypes } from "./order.const";

export const OrderSchema = z.object({
  id: z.number(),
  orderbook_address: z.string().optional(),
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
  is_canceled: z.boolean().optional(),
  is_expired: z.boolean().optional(),
  is_fulfilled: z.boolean().optional(),
  is_refunded: z.boolean().optional(),
  refundable_amount: z.number().optional(),
});

export const OrderTotalSchema = z.object({
  orderbook_address: z.string(),
  total_token_amount: z.number(),
  token_address: z.string(),
});

export const OrderTotalListSchema = z.array(OrderTotalSchema);

export const OrdersListSchema = z.object({
  orders: z.array(OrderSchema),
  total_count: z.number(),
});

export const RefundableOrdersListSchema = OrdersListSchema.extend({
  orders: z.array(OrderSchema).optional(),
});

export const normalizeRefundableOrdersList = (
  ordersList: z.infer<typeof RefundableOrdersListSchema>
): z.infer<typeof OrdersListSchema> => ({
  ...ordersList,
  orders: ordersList.orders ?? [],
});
