import { z } from "zod";
import { UserBalanceSchema } from "~/lib/userBalance/balance.schema";

export type UserBalanceType = z.infer<typeof UserBalanceSchema>;
