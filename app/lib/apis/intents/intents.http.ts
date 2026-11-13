import axios, { isAxiosError, type AxiosInstance } from "axios";
import type { z } from "zod";

import {
  intentErrorBodySchema,
  intentOperationSchema,
  intentQuoteSchema,
  intentRoutesSchema,
} from "./intents.schema";
import { IntentsApiError, type IntentsApi } from "./intents.types";

/**
 * How Equiteez identifies itself to the shared 1Click backend. The Equiteez RWA
 * bearer token is deliberately NOT forwarded: the new service has its own
 * authorization (open question 3 in near-intents/plan-intents.md). Until that
 * contract lands, access relies on the backend's CORS origin allowlist plus an
 * explicit client identifier, without credentials.
 */
export type IntentsAccessAdapter = {
  getHeaders(): Promise<Record<string, string>> | Record<string, string>;
  withCredentials: boolean;
};

export const originAllowlistAccess: IntentsAccessAdapter = {
  getHeaders: () => ({ "X-Intents-Client": "equiteez" }),
  withCredentials: false,
};

function toApiError(error: unknown): IntentsApiError {
  if (error instanceof IntentsApiError) return error;
  if (isAxiosError(error)) {
    if (!error.response)
      return new IntentsApiError(
        "network",
        "The deposit service is unreachable. Check your connection and try again."
      );
    const body = intentErrorBodySchema.safeParse(error.response.data);
    if (body.success)
      return new IntentsApiError(
        body.data.error.code,
        body.data.error.message,
        error.response.status
      );
    return new IntentsApiError(
      error.response.status === 401 || error.response.status === 403
        ? "unauthorized"
        : error.response.status === 429
          ? "rate_limited"
          : error.response.status === 404
            ? "not_found"
            : "internal",
      "The deposit service returned an error.",
      error.response.status
    );
  }
  return new IntentsApiError(
    "internal",
    error instanceof Error ? error.message : "Unexpected deposit service error."
  );
}

function parse<T extends z.ZodTypeAny>(schema: T, data: unknown): z.output<T> {
  const result = schema.safeParse(data);
  if (!result.success)
    throw new IntentsApiError(
      "invalid_response",
      "The deposit service returned an unexpected response."
    );
  return result.data;
}

export function createIntentsHttpApi(
  baseUrl: string,
  env: string,
  access: IntentsAccessAdapter = originAllowlistAccess,
  client: AxiosInstance = axios.create()
): IntentsApi {
  const url = (path: string) => `${baseUrl.replace(/\/$/, "")}/v1${path}`;
  const request = async <T extends z.ZodTypeAny>(
    schema: T,
    config: {
      method: "GET" | "POST";
      path: string;
      data?: unknown;
      headers?: Record<string, string>;
      signal?: AbortSignal;
    }
  ): Promise<z.output<T>> => {
    if (!baseUrl)
      throw new IntentsApiError(
        "network",
        "The deposit service is not configured."
      );
    try {
      const response = await client.request({
        method: config.method,
        url: url(config.path),
        data: config.data,
        signal: config.signal,
        timeout: 20_000,
        withCredentials: access.withCredentials,
        headers: { ...(await access.getHeaders()), ...config.headers },
      });
      return parse(schema, response.data);
    } catch (error) {
      throw toApiError(error);
    }
  };

  return {
    env,
    getRoutes: async (options) =>
      (
        await request(intentRoutesSchema, {
          method: "GET",
          path: "/routes",
          ...options,
        })
      ).routes,
    getQuote: (body, options) =>
      request(intentQuoteSchema, {
        method: "POST",
        path: "/quotes",
        data: body,
        ...options,
      }),
    createOperation: ({ idempotencyKey, ...body }, options) =>
      request(intentOperationSchema, {
        method: "POST",
        path: "/operations",
        data: body,
        headers: { "Idempotency-Key": idempotencyKey },
        ...options,
      }),
    submitDeposit: (id, txHash, options) =>
      request(intentOperationSchema, {
        method: "POST",
        path: `/operations/${encodeURIComponent(id)}/deposit`,
        data: { txHash },
        ...options,
      }),
    getOperation: (id, options) =>
      request(intentOperationSchema, {
        method: "GET",
        path: `/operations/${encodeURIComponent(id)}`,
        ...options,
      }),
  };
}
