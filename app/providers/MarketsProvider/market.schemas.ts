import { z } from "zod";

export const dodoMavConfigTypeSchema = z.object({
  address: z.string(),
  base_token: z.object({
    token_id: z.string(),
    address: z.string(),
  }),
  quote_token: z.object({
    token_id: z.string(),
    address: z.string(),
  }),
  quote_lp_token: z.object({
    address: z.string(),
    token_id: z.string(),
  }),
  base_lp_token: z.object({
    address: z.string(),
    token_id: z.string(),
  }),
});

export const orderbookConfigTypeSchema = z.object({
  address: z.string(),
});

export const marketsConfigQuerySchema = z.object({
  dodo_mav: z.array(dodoMavConfigTypeSchema),
  orderbook: z.array(orderbookConfigTypeSchema),
});

// types

export type GQL_DodoMavConfigType = z.infer<typeof dodoMavConfigTypeSchema>;
export type GQL_OrderbookConfigType = z.infer<typeof orderbookConfigTypeSchema>;
