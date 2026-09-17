import { z } from "zod";

export const configQuerySchema = z.object({
  super_admin: z.array(
    z.object({
      address: z.string(),
    })
  ),
});

export type GQL_ConfigQueryType = z.infer<typeof configQuerySchema>;
