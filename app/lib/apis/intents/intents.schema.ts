import { z } from "zod";

/**
 * Draft v1 contract of the shared 1Click backend (BE-02/BE-03). Every response
 * is validated here; if the real API differs, only this file and
 * `intents.http.ts` should change.
 */
const rawAmountSchema = z.string().regex(/^\d+$/, "Expected raw integer units");
const evmAddressSchema = z
  .string()
  .regex(/^0x[0-9a-fA-F]{40}$/)
  .transform((value) => value as `0x${string}`);
export const evmHashSchema = z
  .string()
  .regex(/^0x[0-9a-fA-F]{64}$/)
  .transform((value) => value.toLowerCase() as `0x${string}`);
const isoDateSchema = z.string().datetime({ offset: true });

export const intentRouteSchema = z.object({
  id: z.string().min(1),
  enabled: z.boolean(),
  source: z.object({
    chainId: z.number().int().positive(),
    chainName: z.string().min(1),
    token: z.object({
      address: z.union([z.literal("native"), evmAddressSchema]),
      symbol: z.string().min(1),
      name: z.string().min(1).optional(),
      decimals: z.number().int().min(0).max(36),
    }),
  }),
  destination: z.object({
    network: z.string().min(1),
    tokenAddress: z.string().min(1),
    tokenId: z.string().regex(/^\d+$/),
    symbol: z.string().min(1),
    decimals: z.number().int().min(0).max(36),
  }),
  minAmountIn: rawAmountSchema,
  maxAmountIn: rawAmountSchema.optional(),
});
export const intentRoutesSchema = z.object({
  routes: z.array(intentRouteSchema),
});

export const intentQuoteSchema = z.object({
  routeId: z.string().min(1),
  amountIn: rawAmountSchema,
  amountOut: rawAmountSchema,
  minAmountOut: rawAmountSchema,
  expiresAt: isoDateSchema,
  recipient: z.string().min(1),
});

export const intentStatusSchema = z.enum([
  "awaiting_deposit",
  "deposit_detected",
  "swapping",
  "delivered",
  "forwarding",
  "wrapped",
  "refunded",
  "expired",
  "failed",
]);

export const intentErrorCodeSchema = z.enum([
  "sponsorship_unavailable",
  "destination_busy",
  "quote_expired",
  "below_minimum",
  "route_disabled",
  "unauthorized",
  "rate_limited",
  "not_found",
  "internal",
]);

export const intentFundingSchema = z.object({
  chainId: z.number().int().positive(),
  /** 1Click source deposit address. Never the destination forwarder. */
  depositAddress: evmAddressSchema,
  token: z.union([z.literal("native"), evmAddressSchema]),
  amount: rawAmountSchema,
  memo: z.string().optional(),
});

export const intentOperationSchema = z.object({
  id: z.string().min(1),
  version: z.number().int().nonnegative(),
  updatedAt: isoDateSchema,
  routeId: z.string().min(1),
  recipient: z.string().min(1),
  sourceAddress: evmAddressSchema,
  amountIn: rawAmountSchema,
  amountOut: rawAmountSchema,
  minAmountOut: rawAmountSchema,
  quoteExpiresAt: isoDateSchema,
  funding: intentFundingSchema,
  status: intentStatusSchema,
  sourceTxHash: evmHashSchema.optional(),
  deliveryTxHash: evmHashSchema.optional(),
  /** ERC20WrapAsked identity emitted by the sponsored forward. */
  forwardTxHash: evmHashSchema.optional(),
  forwardLogIndex: z.number().int().nonnegative().optional(),
  refund: z
    .object({
      txHash: evmHashSchema.optional(),
      reason: z.string().optional(),
    })
    .optional(),
  error: z
    .object({ code: intentErrorCodeSchema, message: z.string() })
    .optional(),
});

export const intentErrorBodySchema = z.object({
  error: z.object({
    code: intentErrorCodeSchema.catch("internal"),
    message: z.string().catch("The deposit service returned an error."),
  }),
});
