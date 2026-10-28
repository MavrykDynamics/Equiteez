import { BigNumber } from "bignumber.js";
import type {
  RelayConfig,
  RelayConfigResult,
} from "~/lib/apis/rwa/relay/relay.types";
import type { fetchRelayCredits } from "~/lib/apis/rwa/relay/relay";
import type { RelayRecord } from "~/lib/relay/relay.storage";

export type Credits = Awaited<ReturnType<typeof fetchRelayCredits>>;
// TODO(gas): temporary hardcoded tariff until the API exposes a Credit price.
// One Gas Credit costs this many fee tokens (USDT).
export const CREDIT_PRICE_USDT = 1;
export const CREDIT_PACKAGES = [5, 20, 50] as const;
export const DEFAULT_CREDIT_PACKAGE = 20;
export const CUSTOM_TOP_UP_MIN_USDT = 5;
export const CUSTOM_TOP_UP_MAX_USDT = 100;

export type CreditsTone = "healthy" | "low" | "empty" | "free";

export type CreditsBalanceStatus =
  | "unknown"
  | "loading"
  | "error"
  | "ready"
  | "free";

// Quote-token units only: neither a Credit denomination nor a USD valuation.
export function formatCreditTokenUnits(units: string, decimals: number) {
  return new BigNumber(units).shiftedBy(-decimals).toFixed();
}

export function getCreditsBalanceStatus({
  authenticated,
  config,
  credits,
  isError,
}: {
  authenticated: boolean;
  config?: RelayConfigResult;
  credits?: Credits;
  isError: boolean;
}): CreditsBalanceStatus {
  if (!authenticated) return "unknown";
  if (isError || config?.state === "disabled") return "error";
  if (!config) return "loading";
  if (!config.config.enabled) return "unknown";
  if (!config.config.fee.enabled) return "free";
  if (!credits) return "loading";
  if (!credits.enabled || credits.decimals !== config.config.fee.decimals)
    return "error";
  return "ready";
}

export function getTopUpProgress(
  records: RelayRecord[],
  // When the last successful credits read completed (ms); 0 when none.
  creditsReadAt = 0
): "pending" | "updating" | null {
  const topUps = records.filter(
    (record) => record.row?.intentKind === "fee_top_up" || record.topUp
  );
  if (topUps.some((record) => record.state !== "settled")) return "pending";
  // Updating until a credits read completes after this tab saw the
  // confirmation (both client clock); the credit endpoint has no settlement
  // watermark beyond that.
  if (
    topUps.some(
      (record) =>
        record.row?.status === "confirmed" &&
        creditsReadAt <= (record.settledObservedAt ?? 0)
    )
  )
    return "updating";
  return null;
}

export function getCreditFeeText(
  config: RelayConfigResult | undefined,
  variant: string
) {
  if (!config) return "Service fee: loading…";
  if (config.state !== "ready" || !config.config.enabled)
    return "Service fee unavailable";
  const fee = config.config.fee;
  if (!fee.enabled)
    return "Network gas paid by Equiteez. No relay service fee.";
  const units = fee.feeSchedule[variant] ?? "0";
  if (new BigNumber(units).isZero())
    return "Network gas paid by Equiteez. This action has no relay service fee.";
  return `Network gas paid by Equiteez. Scheduled service fee: ${formatCreditTokenUnits(units, fee.decimals)} quote tokens from prepaid balance. Free-allowance applicability is unconfirmed. This is not an additional wallet transfer; protocol fees remain separate.`;
}

export function getCreditTokenLabel(config: RelayConfig) {
  return config.fee.enabled
    ? `${config.fee.tokenContract} / token ${config.fee.tokenId}`
    : null;
}

export function getCreditsCount(units: string, decimals: number) {
  return new BigNumber(units)
    .shiftedBy(-decimals)
    .dividedToIntegerBy(CREDIT_PRICE_USDT);
}

export function getCreditsTone(
  count: BigNumber,
  freeAllowance: number
): CreditsTone {
  if (count.isZero() && freeAllowance > 0) return "free";
  if (count.gt(2)) return "healthy";
  return count.isZero() ? "empty" : "low";
}

export function formatCredits(count: BigNumber.Value) {
  const value = new BigNumber(count);
  return `${value.toFormat()} Gas ${value.eq(1) ? "Credit" : "Credits"}`;
}

export function formatUsdt(amount: BigNumber.Value) {
  return new BigNumber(amount).toFormat(2);
}
