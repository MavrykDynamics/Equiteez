import { z } from "zod";

/**
 * Mavryk Bridge ETH backend, API schema 0.1.0 (`GET /openapi.json`,
 * `near-intents/backend.md`). Every response is validated here; contract
 * changes should only touch this file and `intents.http.ts`.
 *
 * Enumerations accept unknown future values as "UNKNOWN" instead of failing,
 * so an operation is preserved and funding stops when its state cannot be
 * interpreted (backend.md §5).
 */
const withUnknown = <const T extends readonly [string, ...string[]]>(
  values: T
) =>
  z
    .string()
    .transform((value): T[number] | "UNKNOWN" =>
      (values as readonly string[]).includes(value)
        ? (value as T[number])
        : "UNKNOWN"
    );

/** Canonical base-unit decimal string; inputs are positive. */
export const positiveAmountSchema = z.string().regex(/^[1-9][0-9]{0,77}$/);
/** Balances and accounting projections can be "0". */
export const amountSchema = z.string().regex(/^(0|[1-9][0-9]{0,77})$/);
export const evmAddressSchema = z
  .string()
  .regex(/^0x[0-9a-fA-F]{40}$/)
  .transform((value) => value as `0x${string}`);
export const evmHashSchema = z
  .string()
  .regex(/^0x[0-9a-fA-F]{64}$/)
  .transform((value) => value.toLowerCase() as `0x${string}`);
export const routeIdSchema = z
  .string()
  .regex(/^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,127}$/);
export const mavrykRecipientSchema = z
  .string()
  .regex(/^mv1[1-9A-HJ-NP-Za-km-z]{33}$/);
const chainIdSchema = z.string().regex(/^\d+$/);
const dateSchema = z.string().datetime({ offset: true });
const uuidSchema = z.string().uuid();

export const intentRouteSchema = z.object({
  id: routeIdSchema,
  version: z.number().int().min(1).max(2147483647),
  enabled: z.boolean(),
  sourceChainId: chainIdSchema,
  settlementChainId: chainIdSchema,
  /** Provider asset identifiers; never derived from ticker symbols. */
  originAsset: z.string().min(1),
  destinationAsset: z.string().min(1),
  settlementToken: evmAddressSchema,
  factoryAddress: evmAddressSchema,
  bridgeAddress: evmAddressSchema,
  sourceDecimals: z.number().int().min(0),
  settlementDecimals: z.number().int().min(0),
  /** Inclusive source-unit admission bounds. */
  minAmountIn: positiveAmountSchema,
  maxAmountIn: positiveAmountSchema,
  /** Minimum accepted output, settlement ERC-20 units. */
  minAmountOut: positiveAmountSchema,
  maxSlippageBps: z.number().int().min(0).max(9999),
});
/** Entries are validated one by one so one bad route does not hide the rest. */
export const intentRoutesEnvelopeSchema = z.object({
  routes: z.array(z.unknown()),
});

export const intentOperationRequestSchema = z.object({
  routeId: routeIdSchema,
  routeVersion: z.number().int().min(1).max(2147483647),
  sourceAddress: evmAddressSchema,
  recipient: mavrykRecipientSchema,
  refundAddress: evmAddressSchema,
  amountIn: positiveAmountSchema,
  slippageBps: z.number().int().min(0).max(9999),
  /** User-accepted lower bound, settlement ERC-20 units. */
  acceptedMinAmountOut: positiveAmountSchema,
});

export const intentPhaseSchema = withUnknown([
  "PREPARING_QUOTE",
  "AWAITING_DEPOSIT",
  "SWAP_IN_PROGRESS",
  "VERIFYING_DELIVERY",
  "DELIVERY_VERIFIED",
  "FORWARDING",
  "WRAPPED",
]);
export const intentAttentionSchema = withUnknown([
  "NONE",
  "RETRYING",
  "ROUTE_PAUSED",
  "MANUAL_REVIEW",
  "PROVIDER_UNAVAILABLE",
  "DEPOSIT_INCOMPLETE",
  "REFUND_PENDING",
  "RECONCILE_REQUIRED",
]);
export const intentClosureSchema = withUnknown(["OPEN", "QUOTE_REJECTED"]);
export const intentFundingStatusSchema = withUnknown([
  "NOT_READY",
  "AVAILABLE",
  "EXPIRED",
  "PAUSED",
  "OBSERVED",
]);
export const intentProviderStatusSchema = withUnknown([
  "PENDING_DEPOSIT",
  "KNOWN_DEPOSIT_TX",
  "INCOMPLETE_DEPOSIT",
  "PROCESSING",
  "SUCCESS",
  "REFUNDED",
  "FAILED",
]);

export const intentFundingInstructionsSchema = z.object({
  quoteId: uuidSchema,
  sourceChainId: chainIdSchema,
  originAsset: z.string().min(1),
  /** Where the wallet sends funds. In real 1Click mode never the forwarder. */
  depositAddress: evmAddressSchema,
  /** Null in this release. Anything else blocks funding (no memo support). */
  depositMemo: z.unknown().transform((value) => value ?? null),
  /** Exact source base units to fund. */
  amount: positiveAmountSchema,
  /** Settlement ERC-20 units. */
  amountOut: positiveAmountSchema,
  minAmountOut: positiveAmountSchema,
  /** Rounded down to destination precision, still settlement ERC-20 units. */
  bridgeableAmountOut: positiveAmountSchema,
  bridgeableMinAmountOut: positiveAmountSchema,
  deadline: dateSchema,
  /** UI funding cut-off; earlier than the provider deadline. */
  fundingExpiresAt: dateSchema,
  /** Settlement-chain recipient of 1Click's output; resolved by the backend. */
  forwarderAddress: evmAddressSchema,
});

export const intentDeliverySchema = z.object({
  status: withUnknown([
    "NOT_OBSERVED",
    "VERIFYING",
    "VERIFIED",
    "AMBIGUOUS",
    "RECONCILE_REQUIRED",
  ]),
  expectedAmount: amountSchema.nullable(),
  confirmedAmount: amountSchema,
  transferCount: z.number().int().min(0),
  /** 1Click → forwarder delivery transfers. Never bridge event identities. */
  transactionHashes: z.array(evmHashSchema),
});

export const intentBridgeEventSchema = z.object({
  transactionHash: evmHashSchema,
  logIndex: z.number().int().min(0),
  amount: amountSchema,
});

export const intentForwardingSchema = z.object({
  status: withUnknown([
    "NOT_READY",
    "READY",
    "IN_PROGRESS",
    "RECONCILE_REQUIRED",
    "WRAPPED",
  ]),
  transactionHash: evmHashSchema.nullable(),
  wrappedAmount: amountSchema,
  bridgeableAmount: amountSchema,
  remainingAmount: amountSchema,
  dustAmount: amountSchema,
  /** ERC20WrapAsked identities: the only join key with bridge settlement data. */
  bridgeEvents: z.array(intentBridgeEventSchema),
});

export const intentMintSchema = z.object({
  wrapTransactionHash: evmHashSchema,
  wrapLogIndex: z.number().int().min(0),
  operationHash: z.string().min(1),
  blockHash: z.string().min(1),
  level: z.number().int().min(1),
  amount: amountSchema,
});

export const intentSettlementSchema = z.object({
  status: withUnknown([
    "NOT_TRACKED",
    "PENDING",
    "CONFIRMED",
    "RECONCILE_REQUIRED",
  ]),
  /** Destination FA2 base units (six decimals for current pairings). */
  confirmedAmount: amountSchema,
  tokenAddress: z.string().nullable(),
  tokenId: amountSchema.nullable(),
  mavrykChainId: z.string().nullable(),
  mints: z.array(intentMintSchema),
});

export const intentRefundSchema = z.object({
  /** Provider report; not independently verified on chain. */
  status: withUnknown(["REPORTED"]),
  amount: amountSchema,
  asset: z.string(),
  recipient: evmAddressSchema,
});

export const intentOperationSchema = intentOperationRequestSchema.extend({
  id: uuidSchema,
  phase: intentPhaseSchema,
  attention: intentAttentionSchema,
  closure: intentClosureSchema,
  /** Stored row version; projected evidence can change independently. */
  revision: z.number().int().min(1),
  fundingStatus: intentFundingStatusSchema,
  fundingInstructions: intentFundingInstructionsSchema.nullable(),
  /** Provider report; never independent chain proof. */
  providerStatus: intentProviderStatusSchema.nullable(),
  delivery: intentDeliverySchema,
  forwarding: intentForwardingSchema,
  settlement: intentSettlementSchema,
  refund: intentRefundSchema.nullable(),
  createdAt: dateSchema,
  updatedAt: dateSchema,
  lastCheckedAt: dateSchema.nullable(),
  nextCheckAt: dateSchema.nullable(),
  retryAfterMs: z.number().int().min(0),
});

export const intentErrorCodes = [
  "VALIDATION_ERROR",
  "AMOUNT_OUT_OF_RANGE",
  "SLIPPAGE_OUT_OF_RANGE",
  "MIN_OUTPUT_TOO_LOW",
  "NOT_FOUND",
  "OPERATION_NOT_FOUND",
  "IDEMPOTENCY_CONFLICT",
  "ROUTE_UNAVAILABLE",
  "PAYLOAD_TOO_LARGE",
  "UNSUPPORTED_MEDIA_TYPE",
  "RATE_LIMITED",
  "INTERNAL_ERROR",
  "DEPENDENCY_UNAVAILABLE",
  "REHEARSAL_SCOPE_MISMATCH",
] as const;

export const intentErrorBodySchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string().catch("The deposit service returned an error."),
    requestId: z.string().optional(),
  }),
});
