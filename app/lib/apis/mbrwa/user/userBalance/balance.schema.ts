import { z } from "zod";

export const UserBalanceSchema = z.object({
  pnl: z.number(),
  available_usdt: z.number(),
  account_value: z.number(),
});
