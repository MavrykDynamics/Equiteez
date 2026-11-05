import { z } from "zod";

const nat = z.string().regex(/^\d+$/);
const integer = z.number().int().nonnegative().safe();
const address = z.string().min(1);
const timestamp = z.string().datetime({ offset: true });
export const relayStatusSchema = z.enum([
  "pending",
  "batched",
  "injecting",
  "submitted",
  "confirmed",
  "failed",
  "rejected",
]);
export const relayRemedySchema = z.enum(["retry", "re-sign", "give-up"]);
const feeOff = z.object({ enabled: z.literal(false) });
const feeOn = z.object({
  enabled: z.literal(true),
  tokenContract: address,
  tokenId: integer,
  decimals: integer,
  collector: address,
  feeSchedule: z.record(nat),
  defaultFeeUnits: nat,
  topUpMinUnits: nat,
  topUpMaxUnits: nat,
  freeAllowanceOps: integer,
  entrypoint: z.string().min(1),
});
export const relayConfigSchema = z.object({
  enabled: z.boolean(),
  fee: z.discriminatedUnion("enabled", [feeOff, feeOn]),
  contracts: z.array(
    z.object({
      address,
      kind: z.enum([
        "rwa_token",
        "orderbook",
        "quote_token",
        "kyc",
        "launchpad",
      ]),
      permitActions: z.array(z.string()),
    })
  ),
  gaslessThresholdMumav: nat,
});
const placeOrder = {
  orderbookAddress: address,
  rwaTokenAmount: nat,
  pricePerRwaToken: nat,
  currency: z.string().min(1),
  orderExpiry: timestamp.nullable().optional(),
  isMarketOrder: z.boolean().optional(),
};
const order = { orderId: nat, orderType: z.enum(["BUY", "SELL"]) };
export const relayIntentSchema = z
  .discriminatedUnion("kind", [
    z.object({ kind: z.literal("place_buy_order"), ...placeOrder }),
    z.object({ kind: z.literal("place_sell_order"), ...placeOrder }),
    z.object({
      kind: z.literal("cancel_orders"),
      orderbookAddress: address,
      orders: z.array(z.object(order)).min(1).max(10),
    }),
    z.object({
      kind: z.literal("process_refund"),
      orderbookAddress: address,
      orders: z.array(z.object(order)).min(1).max(100).optional(),
      // Legacy single-order form; kept only to read previously stored attempts.
      orderId: order.orderId.optional(),
      orderType: order.orderType.optional(),
    }),
    z.object({
      kind: z.literal("update_operators"),
      tokenAddress: address,
      tokenId: z.string().regex(/^(0|[1-9]\d*)$/),
      operator: address,
      operatorAction: z.literal("add_operator").optional(),
    }),
  ])
  .superRefine((intent, ctx) => {
    if (intent.kind !== "process_refund") return;
    const hasLegacy =
      intent.orderId !== undefined || intent.orderType !== undefined;
    const isLegacy =
      intent.orderId !== undefined && intent.orderType !== undefined;
    // Exactly one form: never mix the order list with the single-order fields.
    if (intent.orders ? hasLegacy : !isLegacy)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Refund intent must use either orders or orderId/orderType",
      });
  });
export const relaySubmitSchema = z
  .object({
    intent: relayIntentSchema,
    operation: z.object({
      to: address,
      amount: z.union([z.literal(0), z.literal("0")]).optional(),
      parameter: z.object({
        entrypoint: z.literal("permitAndExecute"),
        // Cryptographic and live-script verification belongs to the permit builder.
        value: z.array(z.unknown()).length(1),
      }),
    }),
    idempotencyKey: z
      .string()
      .regex(/^[\x21-\x7e]{1,128}$/)
      .optional(),
    permitCounter: nat.optional(),
  })
  .superRefine((request, ctx) => {
    const destination =
      request.intent.kind === "update_operators"
        ? request.intent.tokenAddress
        : request.intent.orderbookAddress;
    if (request.operation.to !== destination) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Intent destination mismatch",
        path: ["operation", "to"],
      });
    }
  });
export const relayAcceptedSchema = z.object({
  operationId: z.string().uuid(),
  gasStationOperationId: z.string(),
  status: relayStatusSchema,
});
export const relayOperationSchema = z.object({
  operationId: z.string().uuid(),
  gasStationOperationId: z.string().nullable(),
  status: relayStatusSchema,
  intentKind: z.enum([
    "place_buy_order",
    "place_sell_order",
    "cancel_orders",
    "process_refund",
    "update_operators",
    "launchpad_purchase",
    "fee_top_up",
  ]),
  // Read intents include top-ups/launchpads whose execution is outside this adapter.
  intent: z.record(z.unknown()),
  contractAddress: address,
  permitVariant: z.string(),
  opHash: z.string().nullable(),
  feeChargedUnits: nat.nullable(),
  error: z
    .object({
      code: z.string(),
      message: z.string(),
      remedy: relayRemedySchema,
    })
    .nullable(),
  createdAt: timestamp,
  updatedAt: timestamp,
  settledAt: timestamp.nullable(),
});
export const relayListSchema = z.object({
  items: z.array(relayOperationSchema),
  nextCursor: z.string().nullable(),
});
export const relayCreditsSchema = z.discriminatedUnion("enabled", [
  feeOff,
  z.object({
    enabled: z.literal(true),
    signerAddress: address,
    balanceUnits: nat,
    decimals: integer,
    actionsRemaining: z.record(integer),
    freeAllowanceRemaining: integer,
    lifetimeToppedUpUnits: nat,
    lifetimeSpentUnits: nat,
  }),
]);
// RFC3339 with whole seconds and an explicit offset; bare epoch strings are refused.
export const rfc3339Seconds = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(Z|[+-]\d{2}:\d{2})$/)
  .refine((value) => Number.isFinite(Date.parse(value)));
export const relayTopUpSchema = z.object({
  publicKey: z.string().min(1),
  signature: z.string().min(1),
  amountUnits: nat,
  // The exact deadline inside the signed payload.
  deadline: rfc3339Seconds,
});
export const relayTopUpAcceptedSchema = z.object({
  operationId: z.string().uuid(),
  gasStationOperationId: z.string(),
  signerAddress: address,
  amountUnits: nat,
});
