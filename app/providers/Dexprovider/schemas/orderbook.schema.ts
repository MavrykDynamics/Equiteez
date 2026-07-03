import { z } from "zod";

const OrderbookItemSchema = z.object({
  address: z.string(),
  last_matched_price: z.number(),
  lowest_sell_price: z.number(),
  highest_buy_price: z.number(),
  sell_order_fee: z.number(),
  buy_order_fee: z.number(),
  rwa_token: z
    .object({
      address: z.string(),
      name: z.string(),
      symbol: z.string(),
      decimals: z.number(),
    })
    .optional(),
  quote_token: z.object({
    address: z.string(),
    symbol: z.string(),
    decimals: z.number(),
  }),
});

export const OrderbooksListSchema = z.array(OrderbookItemSchema);

export const OrderbookPricesSchema = z.object({
  buy_price_per_token: z.number(),
  sell_price_per_token: z.number(),
});

export type OrderbooksList = z.infer<typeof OrderbooksListSchema>;
export type OrderbookPrices = z.infer<typeof OrderbookPricesSchema>;
