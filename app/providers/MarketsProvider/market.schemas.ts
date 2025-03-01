import { z } from "zod";

const marketTokenSchema = z.object({
  address: z.string(),
  token_id: z.number(),
});

export const dodoMavConfigTypeSchema = z.object({
  address: z.string(),
  base_token: marketTokenSchema,
  quote_token: marketTokenSchema,
  quote_lp_token: marketTokenSchema,
  base_lp_token: marketTokenSchema,
});

export const orderbookConfigTypeSchema = z.object({
  address: z.string(),
  rwa_token: z.object({
    address: z.string(),
  }),
});

export const marketsConfigQuerySchema = z.object({
  dodo_mav: z.array(dodoMavConfigTypeSchema),
  orderbook: z.array(orderbookConfigTypeSchema),
});

// types

export type GQL_DodoMavConfigType = z.infer<typeof dodoMavConfigTypeSchema>;
export type GQL_OrderbookConfigType = z.infer<typeof orderbookConfigTypeSchema>;
