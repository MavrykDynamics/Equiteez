import { z } from "zod";
import { bridgeHashSchema } from "~/lib/apis/rwa/bridge/bridge.schema";

/** Signer transitions observed in events.md, used directly for widget progress. */
export const bridgeDepositEventSchema = z.object({
  direction: z.literal("in"),
  initial_tx_hash: bridgeHashSchema.transform((hash) => hash.toLowerCase()),
  initial_log_index: z.number().int().nonnegative(),
  mavryk_address: z.string().min(1),
  signatory: z.string().min(1),
  status: z.enum(["PENDING", "PROCESSING", "COMPLETED"]),
  updated_at: z.string().datetime({ offset: true }),
  amount: z.string().regex(/^\d+$/),
  erc_token: z
    .string()
    .regex(/^0x[0-9a-fA-F]{40}$/)
    .transform((address) => address.toLowerCase()),
});
export type BridgeDepositEvent = z.infer<typeof bridgeDepositEventSchema>;
export const getBridgeEventId = (event: BridgeDepositEvent) =>
  `${event.initial_tx_hash}:${event.initial_log_index}`;
