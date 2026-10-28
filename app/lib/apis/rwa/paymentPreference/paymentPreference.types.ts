import { z } from "zod";
import {
  apiPaymentMethodSchema,
  paymentPreferenceSchema,
  walletProfileSchema,
} from "./paymentPreference.schema";

export type ApiPaymentMethod = z.infer<typeof apiPaymentMethodSchema>;
export type GasPaymentMethod = "credits" | "mvrk";
export type PaymentPreference = {
  method: GasPaymentMethod;
  source: string;
  version: number;
  updatedAt: string | null;
};
export type PaymentPreferenceResponse = z.infer<typeof paymentPreferenceSchema>;
export type WalletProfileResponse = z.infer<typeof walletProfileSchema>;
export type WalletProfile = {
  walletAddress: string;
  paymentPreference: PaymentPreference;
};
// conflict: stale expected_version, reload before a deliberate new Save.
// unknown: timeout/network, the write may have committed, recover with GET.
export type PaymentPreferenceErrorKind =
  | "conflict"
  | "unavailable"
  | "unauthorized"
  | "unknown"
  | "failed";
