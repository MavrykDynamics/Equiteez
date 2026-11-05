import { z } from "zod";

export const apiPaymentMethodSchema = z.enum(["gasless", "mvrk"]);
export const paymentPreferenceSchema = z.object({
  payment_method: apiPaymentMethodSchema,
  source: z.string().min(1),
  version: z.number().int().nonnegative().safe(),
  updated_at: z.string().datetime({ offset: true }).nullable(),
});
export const walletProfileSchema = z.object({
  wallet_address: z.string().min(1),
  payment_preference: paymentPreferenceSchema,
});
export const savePaymentPreferenceSchema = z.object({
  payment_method: apiPaymentMethodSchema,
  expected_version: z.number().int().nonnegative().safe(),
});
const errorBodySchema = z.object({
  error: z.string().optional(),
  code: z.string().optional(),
});
export const readErrorCode = (data: unknown) => {
  const parsed = errorBodySchema.safeParse(data);
  return parsed.success ? (parsed.data.code ?? parsed.data.error) : undefined;
};
