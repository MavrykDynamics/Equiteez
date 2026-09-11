export const FRESHNESS_MARK_TTL_MS = 30_000;
export const FRESHNESS_REFETCH_INTERVAL_MS = 4_000;

export enum FreshnessSource {
  Orderbook = "orderbook",
  Chain = "chain",
}

export const FRESHNESS_SOURCES = [
  FreshnessSource.Orderbook,
  FreshnessSource.Chain,
] as const;
