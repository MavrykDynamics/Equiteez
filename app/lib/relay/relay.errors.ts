import { isAxiosError } from "axios";
import { z } from "zod";
import { relayRemedySchema } from "~/lib/apis/rwa/relay/relay.schema";

const relayError = z.object({
  error: z.string(),
  message: z.string(),
  remedy: relayRemedySchema,
  detail: z.unknown().optional(),
});
const serviceError = z.object({
  error: z.string(),
  code: z.string().optional(),
});
export type RelayRemedy = z.infer<typeof relayRemedySchema>;
export class RelayApiError extends Error {
  constructor(
    readonly status: number | undefined,
    readonly code: string,
    readonly remedy: RelayRemedy,
    readonly detail: unknown = undefined,
    readonly retryAfterMs = 0,
    readonly cacheBypass: string | undefined = undefined,
    readonly serverMessage: string | undefined = undefined
  ) {
    // Never retain Axios request config: it can contain JWTs and signatures.
    super(`Relay request failed: ${code}`);
    this.name = "RelayApiError";
  }
}
export function parseRetryAfter(value: unknown, now = Date.now()): number {
  if (typeof value !== "string" && typeof value !== "number") return 0;
  const raw = String(value);
  if (/^\d+$/.test(raw)) {
    const delay = Number(raw) * 1000;
    return Number.isFinite(delay) ? delay : 0;
  }
  const date = Date.parse(raw);
  return Number.isFinite(date) ? Math.max(0, date - now) : 0;
}
export function toRelayApiError(error: unknown): RelayApiError {
  if (error instanceof RelayApiError) return error;
  if (!isAxiosError(error))
    return new RelayApiError(undefined, "INVALID_RESPONSE", "give-up");
  const response = error.response;
  const parsed = relayError.safeParse(response?.data);
  const service = serviceError.safeParse(response?.data);
  const status = response?.status;
  const code = parsed.success
    ? parsed.data.error
    : service.success
      ? (service.data.code ?? "SERVICE_ERROR")
      : status
        ? "HTTP_ERROR"
        : "NETWORK_UNKNOWN";
  const remedy = parsed.success
    ? parsed.data.remedy
    : !status || status === 429 || status >= 500
      ? "retry"
      : "give-up";
  return new RelayApiError(
    status,
    code,
    remedy,
    parsed.success ? parsed.data.detail : undefined,
    parseRetryAfter(response?.headers["retry-after"]),
    response?.headers["x-cache-bypass"],
    parsed.success
      ? parsed.data.message
      : service.success
        ? service.data.error
        : undefined
  );
}
// Policy only: a lifecycle owner must supply identical payload/key and reconcile
// unknown outcomes. The transport never retries mutations or wallet prompts.
export function getRelayRetryDelay(
  error: RelayApiError,
  retriesCompleted: number
): number | null {
  if (
    error.remedy !== "retry" ||
    !Number.isInteger(retriesCompleted) ||
    retriesCompleted < 0 ||
    retriesCompleted >= 3
  )
    return null;
  return Math.max(1000 * 2 ** retriesCompleted, error.retryAfterMs);
}
export function canResignRelay(
  error: RelayApiError,
  attemptsCompleted: number,
  isConclusive: boolean
): boolean {
  return (
    isConclusive &&
    ![
      "IDEMPOTENCY_KEY_REUSED",
      "INTENT_MISMATCH",
      "INVALID_PERMIT",
      "UNSUPPORTED_BATCH",
      "INVALID_ENTRYPOINT",
      "AMOUNT_NOT_ZERO",
    ].includes(error.code) &&
    error.remedy === "re-sign" &&
    Number.isInteger(attemptsCompleted) &&
    attemptsCompleted >= 0 &&
    attemptsCompleted < 2
  );
}
export function getRelayErrorAction(error: RelayApiError) {
  if (error.status === 401) return "sign-in";
  if (error.status === 403) return "refused";
  return error.remedy;
}
