import { z } from "zod";

/**
 * Mavryk Bridge ETH backend v0.0.9 (`near-intents/backend.md`; Swagger at
 * `GET /docs` labels it 0.1.0). Every response is validated here; contract
 * changes should only touch this file and `intents.http.ts`.
 *
 * Enumerations accept unknown future values as "UNKNOWN" instead of failing,
 * so an operation is preserved and funding stops when its state cannot be
 * interpreted.
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
/** Settlement token IDs (`usdt0-arbitrum`). */
export const settlementTokenIdSchema = z
  .string()
  .regex(/^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,127}$/);
const settlementTokenVersionSchema = z.number().int().min(1).max(2147483647);
/** Opaque 1Click asset identifier: never parsed, never keyed by symbol. */
export const assetIdSchema = z.string().regex(/^[\x21-\x7e]{1,512}$/);
/** Any source-network address; the format is checked per network. */
export const networkAddressSchema = z.string().regex(/^[\x21-\x7e]{1,256}$/);
export const mavrykRecipientSchema = z
  .string()
  .regex(/^mv1[1-9A-HJ-NP-Za-km-z]{33}$/);
const chainIdSchema = z.string().regex(/^\d+$/);
const dateSchema = z.string().datetime({ offset: true });
const uuidSchema = z.string().uuid();
const slippageSchema = z.number().int().min(0).max(9999);

/** What the user receives on Mavryk (backend.md §6.1). */
export const intentDestinationAssetSchema = z.object({
  chainId: z.string().min(1),
  kind: withUnknown(["fa2"]),
  contractAddress: z.string().min(1),
  tokenId: amountSchema,
  decimals: z.number().int().min(0).max(36),
});

export const intentSettlementTokenSchema = z.object({
  settlementTokenId: settlementTokenIdSchema,
  settlementTokenVersion: settlementTokenVersionSchema,
  isDefault: z.boolean(),
  previewSupported: z.boolean(),
  settlementAsset: z.object({
    assetId: z.string().min(1),
    chainId: chainIdSchema,
    contractAddress: z.string().min(1),
    symbol: z.string().min(1),
    decimals: z.number().int().min(0).max(255),
  }),
  destinationAsset: intentDestinationAssetSchema,
});

/** A source asset offered now (backend.md §6.1). */
export const intentSourceAssetSchema = z.object({
  assetId: assetIdSchema,
  /** One of the twelve network keys (§7); unknown keys are hidden. */
  network: z.string().regex(/^[a-z0-9]{1,32}$/),
  family: withUnknown(["evm", "solana", "near", "aptos", "bitcoin"]),
  evmChainId: z
    .string()
    .regex(/^[1-9][0-9]{0,77}$/)
    .nullable(),
  depositMode: withUnknown(["SIMPLE", "MEMO"]),
  kind: withUnknown(["native", "token"]),
  /** Token contract, mint or account; `null` for native assets. */
  contractAddress: z.string().max(256).nullable(),
  /** Display text, not unique. */
  symbol: z.string().min(1).max(64),
  decimals: z.number().int().min(0).max(255),
  coingeckoId: z.string().nullable(),
});

/** Entries are validated one by one so one bad entry does not hide the rest. */
export const intentMetadataEnvelopeSchema = z.object({
  schemaVersion: z.literal(2),
  admissionPaused: z.boolean(),
  catalog: z.object({
    fetchedAt: dateSchema.nullable(),
    stale: z.boolean(),
  }),
  defaultSettlementToken: z
    .object({
      settlementTokenId: settlementTokenIdSchema,
      settlementTokenVersion: settlementTokenVersionSchema,
    })
    .nullable(),
  settlementTokens: z.array(z.unknown()),
  sourceAssets: z.array(z.unknown()),
});

/** `POST /v1/quotes/preview`: exactly seven fields. */
export const intentPreviewRequestSchema = z.object({
  sourceAssetId: assetIdSchema,
  settlementTokenId: settlementTokenIdSchema,
  settlementTokenVersion: settlementTokenVersionSchema,
  recipient: mavrykRecipientSchema,
  /** An address the user controls on the source network. */
  refundAddress: networkAddressSchema,
  /** Source-asset base units. */
  amountIn: positiveAmountSchema,
  slippageBps: slippageSchema,
});

/** Indicative, non-executable price (backend.md §6.2). */
export const intentPreviewSchema = z.object({
  kind: z.literal("indicative"),
  executable: z.literal(false),
  sourceAssetId: assetIdSchema,
  settlementTokenId: settlementTokenIdSchema,
  settlementTokenVersion: settlementTokenVersionSchema,
  slippageBps: slippageSchema,
  amountIn: amountSchema,
  /** Settlement-token units. */
  amountOut: amountSchema,
  minAmountOut: amountSchema,
  /** Rounded to Mavryk precision, still settlement-token units. */
  bridgeableAmountOut: amountSchema,
  bridgeableMinAmountOut: amountSchema,
  /** FA2 units on Mavryk: what the user receives. */
  destinationAmountOut: amountSchema,
  destinationMinAmountOut: amountSchema,
  destinationAsset: intentDestinationAssetSchema,
  providerTimestamp: dateSchema,
  quotedAt: dateSchema,
  /** Freshness limit (≤ 30s); not a funding deadline. */
  expiresAt: dateSchema,
  providerTimeEstimateSeconds: z.number().min(0).nullable(),
  /** Source units, charged only if a refund happens. */
  refundFee: amountSchema.nullable(),
  /** Settlement-token units, already included in amountOut. */
  withdrawFee: amountSchema.nullable(),
});

/** `POST /v1/operations`: the seven preview fields plus the accepted minimum. */
export const intentOperationRequestSchema = intentPreviewRequestSchema.extend({
  /** User-accepted lower bound, settlement-token units. */
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
  "PROVIDER_UNAVAILABLE",
  "SETTLEMENT_TOKEN_PAUSED",
  "SOURCE_PAUSED",
  "DEPOSIT_INCOMPLETE",
  "REFUND_PENDING",
  "MANUAL_REVIEW",
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
  /** Network key of the deposit (§7). */
  sourceNetwork: z.string().min(1),
  /** Asset to send: the `sourceAssetId`. */
  originAsset: z.string().min(1),
  /** Where to send, on `sourceNetwork`. Never the forwarder. */
  depositAddress: networkAddressSchema,
  /** When set, the deposit must carry this memo. */
  depositMemo: z.string().min(1).nullable(),
  /** Exact source base units to send. */
  amount: positiveAmountSchema,
  /** Settlement-token units. */
  amountOut: positiveAmountSchema,
  minAmountOut: positiveAmountSchema,
  /** Rounded to destination precision, still settlement-token units. */
  bridgeableAmountOut: positiveAmountSchema,
  bridgeableMinAmountOut: positiveAmountSchema,
  deadline: dateSchema,
  /** Send before this; earlier than the deadline by a safety margin. */
  fundingExpiresAt: dateSchema,
  /** Bridge forwarder on Arbitrum One. Informational only. */
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
  /** Destination FA2 base units (six decimals). */
  confirmedAmount: amountSchema,
  tokenAddress: z.string().nullable(),
  tokenId: amountSchema.nullable(),
  mavrykChainId: z.string().nullable(),
  mints: z.array(intentMintSchema),
});

export const intentRefundSchema = z.object({
  /** Provider report; not independently verified on chain. */
  status: withUnknown(["REPORTED"]),
  /** Source units. */
  amount: amountSchema,
  asset: z.string(),
  /** The refund address, on the source network. */
  recipient: z.string(),
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

/** Error codes of backend.md §10. */
export const intentErrorCodes = [
  "VALIDATION_ERROR",
  "NOT_FOUND",
  "OPERATION_NOT_FOUND",
  "SOURCE_ASSET_UNAVAILABLE",
  "SETTLEMENT_TOKEN_UNAVAILABLE",
  "ADMISSION_CHANGED",
  "DIRECT_WRAP_UNSUPPORTED",
  "AMOUNT_TOO_LOW",
  "AMOUNT_TOO_HIGH",
  "PROVIDER_REJECTED",
  "PREVIEW_BELOW_MINIMUM",
  "IDEMPOTENCY_CONFLICT",
  "PAYLOAD_TOO_LARGE",
  "UNSUPPORTED_MEDIA_TYPE",
  "RATE_LIMITED",
  "PREVIEW_BUSY",
  "ADMISSION_CAPACITY_EXCEEDED",
  "INTERNAL_ERROR",
  "CATALOG_STALE",
  "METADATA_DISABLED",
  "QUOTE_PREVIEW_DISABLED",
  "RECOVERY_MODE",
  "DEPENDENCY_UNAVAILABLE",
  "METADATA_UNAVAILABLE",
  "PROVIDER_UNAVAILABLE",
  "PROVIDER_AUTH_UNAVAILABLE",
  "INVALID_QUOTE",
  "PREVIEW_EXPIRED",
] as const;

export const intentErrorBodySchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string().catch("The deposit service returned an error."),
    requestId: z.string().optional(),
  }),
});
