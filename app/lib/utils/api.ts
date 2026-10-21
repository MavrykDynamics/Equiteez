import { z } from "zod";
import type {
  objectOutputType,
  ZodNumber,
  ZodType,
  ZodTypeAny,
  ZodTypeDef,
} from "zod";

type APIFetchReturnType<T> = objectOutputType<
  { code: ZodNumber; status: ZodType<"ok" | "error">; data: ZodType<T> },
  ZodTypeAny
>;

export const api = async <T>(
  url: string,
  options: RequestInit = { method: "GET" },
  // Responses are parsed from unknown JSON, so the schema input type is irrelevant.
  schema: ZodType<T, ZodTypeDef, unknown> = z.any()
): Promise<APIFetchReturnType<T>> => {
  const method = options?.method || "GET";

  const response = await fetch(url, { method, ...options });
  const data: unknown = await response.json();
  const result = schema.safeParse(data);

  if (!result.success) {
    console.error("API Zod schema validation failed:", {
      url,
      method,
      issues: result.error.issues,
    });

    // Reject invalid data so query consumers retain their cache and expose an
    // error state instead of rendering an unchecked response as successful data.
    throw result.error;
  }

  return {
    code: response.status,
    status: response.ok ? "ok" : "error",
    data: result.data,
  };
};
