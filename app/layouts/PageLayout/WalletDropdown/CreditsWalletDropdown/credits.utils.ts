import { BigNumber } from "bignumber.js";
import type {
  RelayConfig,
  RelayConfigResult,
} from "~/lib/apis/rwa/relay/relay.types";
import type { fetchRelayCredits } from "~/lib/apis/rwa/relay/relay";
import type { RelayRecord } from "~/lib/relay/relay.storage";

export type Credits = Awaited<ReturnType<typeof fetchRelayCredits>>;
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
  records: RelayRecord[]
): "pending" | "updating" | null {
  const topUps = records.filter(
    (record) => record.row?.intentKind === "fee_top_up"
  );
  if (topUps.some((record) => record.state !== "settled")) return "pending";
  // The credit endpoint has no settlement watermark. Even a later successful
  // read cannot prove inclusion, and concurrent spending defeats balance deltas.
  if (topUps.some((record) => record.row?.status === "confirmed"))
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
