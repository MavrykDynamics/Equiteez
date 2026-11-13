import type { z } from "zod";
import type {
  intentErrorCodeSchema,
  intentFundingSchema,
  intentOperationSchema,
  intentQuoteSchema,
  intentRouteSchema,
  intentStatusSchema,
} from "./intents.schema";

export type IntentRoute = z.infer<typeof intentRouteSchema>;
export type IntentQuote = z.infer<typeof intentQuoteSchema>;
export type IntentStatus = z.infer<typeof intentStatusSchema>;
export type IntentErrorCode = z.infer<typeof intentErrorCodeSchema>;
export type IntentFunding = z.infer<typeof intentFundingSchema>;
export type IntentOperation = z.infer<typeof intentOperationSchema>;

export type IntentQuoteRequest = {
  routeId: string;
  amountIn: string;
  recipient: string;
};
export type IntentOperationRequest = IntentQuoteRequest & {
  sourceAddress: `0x${string}`;
  /** Stable per confirmed operation; retries return the same operation. */
  idempotencyKey: string;
};

type RequestOptions = { signal?: AbortSignal };

/** The only surface UI code uses; mock and HTTP clients both implement it. */
export interface IntentsApi {
  readonly env: string;
  getRoutes(options?: RequestOptions): Promise<IntentRoute[]>;
  /** Preview only. The executable quote comes with the operation. */
  getQuote(
    request: IntentQuoteRequest,
    options?: RequestOptions
  ): Promise<IntentQuote>;
  createOperation(
    request: IntentOperationRequest,
    options?: RequestOptions
  ): Promise<IntentOperation>;
  /** Reconciliation hint; idempotent and safe to retry. */
  submitDeposit(
    operationId: string,
    txHash: `0x${string}`,
    options?: RequestOptions
  ): Promise<IntentOperation>;
  getOperation(
    operationId: string,
    options?: RequestOptions
  ): Promise<IntentOperation>;
}

/** Typed failure. `network` means the service could not be reached. */
export class IntentsApiError extends Error {
  constructor(
    readonly code: IntentErrorCode | "network" | "invalid_response",
    message: string,
    readonly status?: number
  ) {
    super(message);
    this.name = "IntentsApiError";
  }
}

export const isIntentsApiError = (error: unknown): error is IntentsApiError =>
  error instanceof IntentsApiError;
