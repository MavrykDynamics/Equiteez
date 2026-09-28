import { z } from "zod";

export const bridgeHashSchema = z.string().regex(/^0x[0-9a-fA-F]{64}$/);

// Validate only the documented projection we consume. Signer payloads are not
// deposit rows; neither their statuses nor aggregate IDs enter settlement state.
export const bridgeDepositSchema = z.object({
  evm_tx_hash: bridgeHashSchema.transform((hash) => hash.toLowerCase()),
  log_index: z.number().int().nonnegative(),
  status: z.enum(["confirming", "signing", "executed", "stalled"]),
  chain_from: z.string().min(1),
  chain_to: z.string().min(1),
  updated_at: z.string().datetime({ offset: true }),
  signer_count: z.number().int().nonnegative(),
  signatory_threshold: z.number().int().positive().nullable(),
  required_confirmations: z.number().int().nonnegative().nullable(),
  reason: z.string().nullable().optional(),
  amount: z
    .string()
    .regex(/^\d+(\.\d+)?$/)
    .nullable()
    .optional(),
  amount_raw: z.string().regex(/^\d+$/).optional(),
  decimals: z.number().int().nonnegative().nullable().optional(),
  token: z.string().nullable().optional(),
  token_evm: z.string().optional(),
  created_at: z.string().datetime({ offset: true }).optional(),
});
export const bridgeDepositsSchema = z.object({
  deposits: z.array(bridgeDepositSchema).max(50),
});
export type BridgeDeposit = z.infer<typeof bridgeDepositSchema>;

export const getBridgeDepositId = (row: BridgeDeposit) =>
  `${row.evm_tx_hash}:${row.log_index}`;
