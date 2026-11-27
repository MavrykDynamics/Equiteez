/**
 * Client for POST /api/kyc (app/routes/api.kyc.ts): asks the server to
 * register the signed-in wallet as a KYC member. The server takes the address
 * from the access token, so nothing but the token is sent.
 */
import { getAuthTokensFromStorage } from "~/providers/AuthProvider/helpers/storage";
import { AuthService } from "~/providers/AuthProvider/helpers/auth.service";

export const KYC_API_PATH = "/api/kyc";

export type KycRegistrationResult =
  | { status: "submitted"; opHash: string }
  | { status: "already-member" };

export type KycRegistrationErrorCode =
  | "disabled"
  | "not-configured"
  | "unauthorized"
  | "rwa-unavailable"
  | "rpc-unavailable"
  | "unknown";

export class KycRegistrationError extends Error {
  constructor(readonly code: KycRegistrationErrorCode) {
    super(code);
    this.name = "KycRegistrationError";
  }
}

const KNOWN_CODES = new Set<string>([
  "disabled",
  "not-configured",
  "unauthorized",
  "rwa-unavailable",
  "rpc-unavailable",
]);

const post = (accessToken: string | null | undefined) =>
  fetch(KYC_API_PATH, {
    method: "POST",
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });

const readError = async (response: Response) => {
  const body = (await response.json().catch(() => null)) as {
    error?: string;
  } | null;
  const code = body?.error ?? "";

  return new KycRegistrationError(
    KNOWN_CODES.has(code) ? (code as KycRegistrationErrorCode) : "unknown"
  );
};

export async function requestKycRegistration(): Promise<KycRegistrationResult> {
  const { accessToken } = await getAuthTokensFromStorage();
  let response = await post(accessToken);

  // An expired access token: refresh once and retry, like the RWA client
  if (response.status === 401) {
    const freshToken = await AuthService.refreshAccessToken().catch(() => null);

    if (!freshToken) throw new KycRegistrationError("unauthorized");
    response = await post(freshToken);
  }

  if (!response.ok) throw await readError(response);

  return (await response.json()) as KycRegistrationResult;
}
