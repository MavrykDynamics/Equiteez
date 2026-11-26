import axios, { isAxiosError, type AxiosInstance } from "axios";
import type { z } from "zod";

import { INTENTS_REQUEST_TIMEOUT_MS } from "~/consts/intents";
import {
  intentErrorBodySchema,
  intentErrorCodes,
  intentMetadataEnvelopeSchema,
  intentOperationSchema,
  intentPreviewRequestSchema,
  intentPreviewSchema,
  intentSettlementTokenSchema,
  intentSourceAssetSchema,
} from "./intents.schema";
import {
  IntentsApiError,
  type IntentErrorCode,
  type IntentsApi,
} from "./intents.types";

/**
 * Access adapter for the shared backend (backend.md §3, §5). Equiteez's RWA
 * bearer token is NOT forwarded and no cookies are sent. Metadata and
 * previews are public; operation calls carry the per-operation capability as
 * a bearer token.
 *
 * Only headers the Gateway allows are sent (Authorization, Content-Type,
 * Idempotency-Key). Anything else would fail the CORS preflight.
 */
export const capabilityHeaders = (capability: string) => ({
  Authorization: `Bearer ${capability}`,
});

const knownCodes = new Set<string>(intentErrorCodes);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** `Retry-After` as delta-seconds or an HTTP date. */
export function parseRetryAfter(
  value: unknown,
  now = Date.now()
): number | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1000;
  const date = Date.parse(value);
  return Number.isNaN(date) ? undefined : Math.max(0, date - now);
}

const fallbackCode = (status: number): IntentErrorCode =>
  status === 400
    ? "VALIDATION_ERROR"
    : status === 404
      ? "NOT_FOUND"
      : status === 413
        ? "PAYLOAD_TOO_LARGE"
        : status === 415
          ? "UNSUPPORTED_MEDIA_TYPE"
          : status === 429
            ? "RATE_LIMITED"
            : status === 503
              ? "DEPENDENCY_UNAVAILABLE"
              : status >= 500
                ? "INTERNAL_ERROR"
                : "UNKNOWN";

/**
 * Never wraps the axios error itself: its config holds the Authorization
 * header, which must not reach logs or error reports.
 */
function toApiError(error: unknown): IntentsApiError {
  if (error instanceof IntentsApiError) return error;
  if (isAxiosError(error)) {
    const response = error.response;
    if (!response)
      return new IntentsApiError(
        "NETWORK",
        "The deposit service is unreachable. Check your connection and try again."
      );
    const retryAfterMs = parseRetryAfter(response.headers?.["retry-after"]);
    const body = intentErrorBodySchema.safeParse(response.data);
    if (body.success) {
      const { code, message, requestId } = body.data.error;
      return new IntentsApiError(
        knownCodes.has(code)
          ? (code as IntentErrorCode)
          : fallbackCode(response.status),
        message,
        response.status,
        requestId,
        retryAfterMs
      );
    }
    return new IntentsApiError(
      fallbackCode(response.status),
      "The deposit service returned an error.",
      response.status,
      undefined,
      retryAfterMs
    );
  }
  return new IntentsApiError(
    "UNKNOWN",
    error instanceof Error ? error.message : "Unexpected deposit service error."
  );
}

function parse<T extends z.ZodTypeAny>(schema: T, data: unknown): z.output<T> {
  const result = schema.safeParse(data);
  if (!result.success)
    throw new IntentsApiError(
      "INVALID_RESPONSE",
      "The deposit service returned an unexpected response."
    );
  return result.data;
}

/** Validates entries one by one so one bad entry does not hide the rest. */
function parseEach<T extends z.ZodTypeAny>(
  schema: T,
  entries: unknown[],
  label: string
): z.output<T>[] {
  const valid: z.output<T>[] = [];
  for (const entry of entries) {
    const result = schema.safeParse(entry);
    if (result.success) valid.push(result.data);
  }
  if (valid.length < entries.length)
    console.warn(
      `Ignored ${entries.length - valid.length} 1Click ${label} that do not match the API contract.`
    );
  return valid;
}

export function createIntentsHttpApi(
  baseUrl: string,
  env: string,
  client: AxiosInstance = axios.create()
): IntentsApi {
  const url = (path: string) => `${baseUrl.replace(/\/$/, "")}/v1${path}`;
  const send = async (config: {
    method: "GET" | "POST";
    path: string;
    data?: unknown;
    headers?: Record<string, string>;
    signal?: AbortSignal;
  }) => {
    if (!baseUrl)
      throw new IntentsApiError(
        "NETWORK",
        "The deposit service is not configured."
      );
    try {
      return await client.request({
        method: config.method,
        url: url(config.path),
        data: config.data,
        signal: config.signal,
        timeout: INTENTS_REQUEST_TIMEOUT_MS,
        withCredentials: false,
        headers: config.headers,
      });
    } catch (error) {
      throw toApiError(error);
    }
  };

  return {
    env,
    async getMetadata(options) {
      const response = await send({
        method: "GET",
        path: "/metadata",
        ...options,
      });
      const envelope = parse(intentMetadataEnvelopeSchema, response.data);
      return {
        admissionPaused: envelope.admissionPaused,
        catalog: envelope.catalog,
        defaultSettlementToken: envelope.defaultSettlementToken,
        settlementTokens: parseEach(
          intentSettlementTokenSchema,
          envelope.settlementTokens,
          "settlement token(s)"
        ),
        sourceAssets: parseEach(
          intentSourceAssetSchema,
          envelope.sourceAssets,
          "source asset(s)"
        ),
      };
    },
    async previewQuote(request, options) {
      const response = await send({
        method: "POST",
        path: "/quotes/preview",
        // Exactly the seven fields; unknown fields are rejected.
        data: intentPreviewRequestSchema.parse(request),
        headers: { "Content-Type": "application/json" },
        ...options,
      });
      const preview = parse(intentPreviewSchema, response.data);
      if (
        preview.sourceAssetId !== request.sourceAssetId ||
        preview.settlementTokenId !== request.settlementTokenId ||
        preview.settlementTokenVersion !== request.settlementTokenVersion ||
        preview.amountIn !== request.amountIn ||
        preview.slippageBps !== request.slippageBps
      )
        throw new IntentsApiError(
          "INVALID_RESPONSE",
          "The deposit service returned a price for a different request."
        );
      return preview;
    },
    async createOperation({ capability, idempotencyKey }, request, options) {
      const response = await send({
        method: "POST",
        path: "/operations",
        // The persisted request, sent byte-for-byte on every retry.
        data: request,
        headers: {
          ...capabilityHeaders(capability),
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        ...options,
      });
      return {
        operation: parse(intentOperationSchema, response.data),
        replayed: String(response.headers?.["idempotency-replayed"]) === "true",
      };
    },
    async getOperation(capability, operationId, options) {
      if (!UUID.test(operationId))
        throw new IntentsApiError("NOT_FOUND", "Unknown operation.", 404);
      const response = await send({
        method: "GET",
        path: `/operations/${operationId}`,
        headers: capabilityHeaders(capability),
        ...options,
      });
      return parse(intentOperationSchema, response.data);
    },
  };
}
