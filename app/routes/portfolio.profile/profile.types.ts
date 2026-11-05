import type { GasPaymentMethod } from "~/lib/apis/rwa/paymentPreference/paymentPreference.types";
export type { GasPaymentMethod } from "~/lib/apis/rwa/paymentPreference/paymentPreference.types";

export type ProfileFormValues = {
  fullName: string;
  email: string;
  gasPaymentMethod: GasPaymentMethod;
};

export type KycInfo = {
  completedAt: string | null;
  renewAt: string | null;
};

export const GAS_PAYMENT_METHOD_OPTIONS: {
  id: GasPaymentMethod;
  label: string;
}[] = [
  { id: "credits", label: "Credits" },
  { id: "mvrk", label: "MVRK" },
];
