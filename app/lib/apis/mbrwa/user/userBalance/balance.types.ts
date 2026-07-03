import { z } from "zod";
import { UserBalanceSchema } from "./balance.schema";

export type UserBalanceType = z.infer<typeof UserBalanceSchema>;
