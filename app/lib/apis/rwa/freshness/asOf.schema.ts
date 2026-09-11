import { z } from "zod";

export const AsOfSourceSchema = z.object({
  level: z.number(),
  timestamp: z.string(),
  realtime: z.boolean(),
});

export const AsOfSchema = z
  .object({
    orderbook: AsOfSourceSchema.optional(),
    chain: AsOfSourceSchema.optional(),
  })
  .strict()
  .default({});
