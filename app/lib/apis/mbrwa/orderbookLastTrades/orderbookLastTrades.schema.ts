import { z } from "zod";

import { OrderTypes } from "~/lib/apis/mbrwa/user/userOrders/order.const";

const orderTypeValues = new Set<number>(
  Object.values(OrderTypes).filter(
    (value): value is number => typeof value === "number"
  )
);

const numericSchema = z
  .union([z.number(), z.string()])
  .transform((value, context) => {
    const numberValue = Number(value);

    if (!Number.isFinite(numberValue)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Expected a finite number",
      });

      return z.NEVER;
    }

    return numberValue;
  });

const atomStringSchema = z
  .union([z.number(), z.string()])
  .transform((value) => value.toString());

const orderTypeSchema = numericSchema
  .refine((value) => orderTypeValues.has(value), "Invalid order type")
  .transform((value) => value as OrderTypes);

export const OrderbookLastTradeEventSchema = z.object({
  counter: numericSchema,
  currency_delta: atomStringSchema,
  fulfilled_after: atomStringSchema,
  fulfilled_before: atomStringSchema,
  id: numericSchema,
  order: z.object({
    created_at: z.string(),
    is_market_order: z.boolean(),
    price_per_rwa_token: atomStringSchema,
  }),
  order_type: orderTypeSchema,
  operation_hash: z.string(),
  timestamp: z.string(),
});

export const OrderbookLastTradesQuerySchema = z.object({
  tradeEvents: z.array(OrderbookLastTradeEventSchema),
});

export type OrderbookLastTradeEvent = z.infer<
  typeof OrderbookLastTradeEventSchema
>;
export type OrderbookLastTradesQueryData = z.infer<
  typeof OrderbookLastTradesQuerySchema
>;
export type OrderbookLastTradesQueryVariables = {
  limit?: number;
  rwaAddress?: string | null;
};
