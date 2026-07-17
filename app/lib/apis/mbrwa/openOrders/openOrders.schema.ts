import { z } from "zod";
import { OrderTypes } from "~/lib/apis/mbrwa/user/userOrders/order.const";

const numericSchema = z
  .union([z.number(), z.string()])
  .transform((value) => Number(value));
const atomStringSchema = z
  .union([z.number(), z.string()])
  .transform((value) => value.toString());

export const OpenOrderSchema = z.object({
  id: numericSchema,
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
  order_id: numericSchema,
  order_type: z.nativeEnum(OrderTypes),
  created_at: z.string(),
  ended_at: z.string().nullable(),
  fulfilled_amount: atomStringSchema,
  orderbook_id: numericSchema,
  price_per_rwa_token: atomStringSchema,
  refunded_amount: atomStringSchema,
  rwa_token_amount: atomStringSchema,
  total_paid_out: atomStringSchema,
  total_usd_value_of_rwa_token_amount: atomStringSchema,
  unfulfilled_amount: atomStringSchema,
});

export const OpenOrdersQuerySchema = z.object({
  buyOrders: z.array(OpenOrderSchema),
  sellOrders: z.array(OpenOrderSchema),
});

export type OpenOrder = z.infer<typeof OpenOrderSchema>;
export type OpenOrdersQueryData = z.infer<typeof OpenOrdersQuerySchema>;
export type OpenOrdersQueryVariables = {
  rwaAddress?: string | null;
  offset?: number;
  limit?: number;
};
export type OpenOrdersByRwaAddressesQueryVariables = {
  rwaAddresses: string[];
};
