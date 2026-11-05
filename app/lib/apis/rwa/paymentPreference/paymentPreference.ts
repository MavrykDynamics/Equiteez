import { isAxiosError } from "axios";
import { z } from "zod";
import { rwaApi } from "~/lib/apis/rwa/client";
import {
  paymentPreferenceSchema,
  readErrorCode,
  savePaymentPreferenceSchema,
  walletProfileSchema,
} from "./paymentPreference.schema";
import type {
  ApiPaymentMethod,
  GasPaymentMethod,
  PaymentPreference,
  PaymentPreferenceErrorKind,
  PaymentPreferenceResponse,
  WalletProfile,
} from "./paymentPreference.types";

const timeout = 15_000;
const walletPath = (wallet: string) =>
  `/wallets/${encodeURIComponent(z.string().min(1).parse(wallet))}`;

export const toGasPaymentMethod = (
  method: ApiPaymentMethod
): GasPaymentMethod => (method === "gasless" ? "credits" : "mvrk");
export const toApiPaymentMethod = (
  method: GasPaymentMethod
): ApiPaymentMethod => (method === "credits" ? "gasless" : "mvrk");
const toPaymentPreference = (
  data: PaymentPreferenceResponse
): PaymentPreference => ({
  method: toGasPaymentMethod(data.payment_method),
  source: data.source,
  version: data.version,
  updatedAt: data.updated_at,
});

export class PaymentPreferenceError extends Error {
  constructor(
    readonly kind: PaymentPreferenceErrorKind,
    readonly status: number | undefined,
    readonly code: string | undefined
  ) {
    // Never retain Axios request config: it contains the wallet JWT.
    super(`Payment preference request failed: ${code ?? kind}`);
    this.name = "PaymentPreferenceError";
  }
}
export function toPaymentPreferenceError(
  error: unknown
): PaymentPreferenceError {
  if (error instanceof PaymentPreferenceError) return error;
  if (!isAxiosError(error))
    return new PaymentPreferenceError("failed", undefined, "INVALID_RESPONSE");
  const status = error.response?.status;
  const code = readErrorCode(error.response?.data);
  const kind: PaymentPreferenceErrorKind = !status
    ? "unknown"
    : status === 409
      ? "conflict"
      : status === 401 || status === 403
        ? "unauthorized"
        : status === 503
          ? "unavailable"
          : "failed";
  return new PaymentPreferenceError(kind, status, code);
}
async function request<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    throw toPaymentPreferenceError(error);
  }
}

export function fetchWalletProfile(
  wallet: string,
  signal?: AbortSignal
): Promise<WalletProfile> {
  return request(async () => {
    const { data } = await rwaApi.get(`${walletPath(wallet)}/profile`, {
      signal,
      timeout,
    });
    const profile = walletProfileSchema.parse(data);
    return {
      walletAddress: profile.wallet_address,
      paymentPreference: toPaymentPreference(profile.payment_preference),
    };
  });
}
export function fetchPaymentPreference(
  wallet: string,
  signal?: AbortSignal
): Promise<PaymentPreference> {
  return request(async () => {
    const { data } = await rwaApi.get(
      `${walletPath(wallet)}/payment-preference`,
      { signal, timeout }
    );
    return toPaymentPreference(paymentPreferenceSchema.parse(data));
  });
}
export function savePaymentPreference(
  wallet: string,
  input: { method: GasPaymentMethod; expectedVersion: number },
  signal?: AbortSignal
): Promise<PaymentPreference> {
  return request(async () => {
    const payload = savePaymentPreferenceSchema.parse({
      payment_method: toApiPaymentMethod(input.method),
      expected_version: input.expectedVersion,
    });
    const { data } = await rwaApi.put(
      `${walletPath(wallet)}/payment-preference`,
      payload,
      { signal, timeout }
    );
    return toPaymentPreference(paymentPreferenceSchema.parse(data));
  });
}
