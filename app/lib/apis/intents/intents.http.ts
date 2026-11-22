import axios, { isAxiosError, type AxiosInstance } from "axios";
import type { z } from "zod";

import {
  intentDepositRegistrationSchema,
  intentErrorBodySchema,
  intentErrorCodes,
  intentMetadataEnvelopeSchema,
  intentMetadataRouteSchema,
  intentOperationSchema,
  intentRouteSchema,
  intentRoutesEnvelopeSchema,
} from "./intents.schema";
import {
  IntentsApiError,
  isIntentsApiError,
  type IntentErrorCode,
  type IntentsApi,
} from "./intents.types";

/**
 * Access adapter for the shared backend (backend.md §2). Equiteez's RWA
 * bearer token is NOT forwarded and no cookies are sent. Routes are public;
 * operation calls carry the per-operation capability as a bearer token.
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
  status === 404
    ? "NOT_FOUND"
    : status === 409
      ? "IDEMPOTENCY_CONFLICT"
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
        timeout: 20_000,
        withCredentials: false,
        headers: config.headers,
      });
    } catch (error) {
      throw toApiError(error);
    }
  };

  return {
    env,
    async getRoutes(options) {
      const response = await send({
        method: "GET",
        path: "/routes",
        ...options,
      });
      const { routes } = parse(intentRoutesEnvelopeSchema, response.data);
      return parseEach(intentRouteSchema, routes, "route(s)");
    },
    async getMetadata(options) {
      let response;
      try {
        response = await send({ method: "GET", path: "/metadata", ...options });
      } catch (error) {
        // Optional endpoint: without it no source asset is inferred.
        if (isIntentsApiError(error) && error.status === 404) return null;
        throw error;
      }
      const { admissionPaused, routes } = parse(
        intentMetadataEnvelopeSchema,
        response.data
      );
      return {
        admissionPaused,
        routes: parseEach(
          intentMetadataRouteSchema,
          routes,
          "metadata route(s)"
        ),
      };
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
    async registerDeposit(capability, operationId, transactionHash, options) {
      if (!UUID.test(operationId))
        throw new IntentsApiError("NOT_FOUND", "Unknown operation.", 404);
      const hash = transactionHash.toLowerCase();
      const response = await send({
        method: "POST",
        path: `/operations/${operationId}/deposit`,
        // The body holds only the hash; no Idempotency-Key (backend.md §4.5).
        data: { transactionHash: hash },
        headers: {
          ...capabilityHeaders(capability),
          "Content-Type": "application/json",
        },
        ...options,
      });
      const body = parse(intentDepositRegistrationSchema, response.data);
      if (
        body.operationId.toLowerCase() !== operationId.toLowerCase() ||
        body.transactionHash !== hash
      )
        throw new IntentsApiError(
          "INVALID_RESPONSE",
          "The deposit service registered a different transfer."
        );
      return { replayed: body.replayed };
    },
  };
}
