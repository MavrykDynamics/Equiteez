import { BigNumber } from "bignumber.js";
import type {
  RelayConfig,
  RelayConfigResult,
} from "~/lib/apis/rwa/relay/relay.types";
import type { fetchRelayCredits } from "~/lib/apis/rwa/relay/relay";
import type { RelayRecord } from "~/lib/relay/relay.storage";

export type Credits = Awaited<ReturnType<typeof fetchRelayCredits>>;
type EnabledCredits = Extract<Credits, { enabled: true }>;
type EnabledFee = Extract<RelayConfig["fee"], { enabled: true }>;
// Credit quantities, not USDT amounts: N Credits cost N × the credit price.
export const CREDIT_PACKAGES = [5, 20, 50] as const;
export const DEFAULT_CREDIT_PACKAGE = 20;
// One Credit is one buy/sell placement at the current tariff.
const PLACEMENT_VARIANTS = ["permitPlaceBuyOrder", "permitPlaceSellOrder"];

export type CreditsTone = "healthy" | "low" | "empty" | "free";

/**
 * The common positive buy/sell price in raw fee-token units, or null when
 * fees are off or the prices differ (no single Credit conversion exists).
 */
export function getCreditPriceUnits(fee?: RelayConfig["fee"]) {
  if (!fee?.enabled) return null;
  const prices = PLACEMENT_VARIANTS.map((variant) => fee.feeSchedule[variant]);
  if (prices.some((price) => !price) || new Set(prices).size !== 1) return null;
  const price = BigInt(prices[0]);
  return price > 0n ? price : null;
}

/** Placements the balance covers, including free allowance exactly once. */
export function getAvailableCredits(credits: EnabledCredits, price: bigint) {
  const [counted] = PLACEMENT_VARIANTS.map(
    (variant) => credits.actionsRemaining[variant]
  ).filter((count) => count !== undefined);
  return (
    counted ?? getPaidCredits(credits, price) + credits.freeAllowanceRemaining
  );
}

export function getPaidCredits(credits: EnabledCredits, price: bigint) {
  return Number(BigInt(credits.balanceUnits) / price);
}

export const toTokenAmount = (units: bigint | string, decimals: number) =>
  new BigNumber(units.toString()).shiftedBy(-decimals);

export const toTokenUnits = (amount: BigNumber.Value, decimals: number) =>
  new BigNumber(amount).shiftedBy(decimals);

export type CreditsSummary = {
  // Prepaid fee-token balance, shown so rounding remainders stay visible.
  balance: BigNumber;
  free: number;
  // Null when buy/sell prices differ: show the token balance instead.
  price: bigint | null;
  available: number | null;
  paid: number | null;
  tone: CreditsTone | null;
};

export function getCreditsSummary(
  credits?: Credits,
  fee?: RelayConfig["fee"]
): CreditsSummary | null {
  if (!credits?.enabled || !fee?.enabled) return null;
  const price = getCreditPriceUnits(fee);
  const balance = toTokenAmount(credits.balanceUnits, credits.decimals);
  const free = credits.freeAllowanceRemaining;
  if (!price)
    return { balance, free, price, available: null, paid: null, tone: null };
  const available = getAvailableCredits(credits, price);
  const paid = getPaidCredits(credits, price);
  return {
    balance,
    free,
    price,
    available,
    paid,
    tone: getCreditsTone(available, paid, free),
  };
}

/** A service charge as Credits, or as fee-token amount when prices differ. */
export function formatCreditCharge(units: bigint, fee: EnabledFee) {
  if (units === 0n) return "Free";
  const price = getCreditPriceUnits(fee);
  return price
    ? formatCredits(new BigNumber(units.toString()).div(price.toString()))
    : `${formatUsdt(toTokenAmount(units, fee.decimals))} USDT`;
}

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

// Thresholds apply to available placements, free allowance included.
export function getCreditsTone(
  available: number,
  paid: number,
  freeAllowance: number
): CreditsTone {
  if (paid === 0 && freeAllowance > 0) return "free";
  if (available > 2) return "healthy";
  return available === 0 ? "empty" : "low";
}

export function formatCredits(count: BigNumber.Value) {
  const value = new BigNumber(count);
  return `${value.toFormat()} Gas ${value.eq(1) ? "Credit" : "Credits"}`;
}

// At least two decimals, never rounded: shown amounts must match signed ones.
export function formatUsdt(amount: BigNumber.Value) {
  const value = new BigNumber(amount);
  return value.toFormat(Math.max(2, value.decimalPlaces() ?? 0));
}
