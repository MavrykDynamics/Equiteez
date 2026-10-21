export const CREDIT_PRICE_USD = 1;
export const LOW_CREDITS_THRESHOLD = 2;

export const CUSTOM_CREDITS_MIN = 5;
export const CUSTOM_CREDITS_MAX = 100;
export const CREDIT_PACKAGES = [5, 20, 50];

export type CreditsBalanceStatus =
  | "healthy"
  | "low"
  | "empty"
  | "pending"
  | "free";

export type CreditsState = {
  balance: number;
  freeCredits: number;
  pendingAmount: number | null;
};

export const getCreditsBalanceStatus = ({
  balance,
  freeCredits,
  pendingAmount,
}: CreditsState): CreditsBalanceStatus => {
  if (pendingAmount) return "pending";
  if (freeCredits > 0) return "free";
  if (balance <= 0) return "empty";
  if (balance <= LOW_CREDITS_THRESHOLD) return "low";

  return "healthy";
};

export const formatCreditsUsd = (credits: number) =>
  `$${(credits * CREDIT_PRICE_USD).toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  })}`;

export const formatCredits = (credits: number) =>
  `${credits} ${credits === 1 ? "Credit" : "Credits"}`;
