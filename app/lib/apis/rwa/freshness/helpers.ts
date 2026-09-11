import type { QueryKey } from "@tanstack/react-query";

import type {
  CacheBypassState,
  FreshQueryKeyStartInput,
  FreshnessSource,
  PeekedFreshQueryMark,
} from "~/lib/apis/rwa/freshness/types";

const normalizeFreshQueryKeyStart = (queryKeyStart: string) =>
  queryKeyStart.trim();

export const getFreshQueryKeyStart = (
  queryKeyStart: FreshQueryKeyStartInput
) => {
  if (typeof queryKeyStart === "string") {
    return normalizeFreshQueryKeyStart(queryKeyStart);
  }

  const firstPart = queryKeyStart[0];

  return typeof firstPart === "string"
    ? normalizeFreshQueryKeyStart(firstPart)
    : "";
};

export const isFreshQueryMatch = (
  queryKey: QueryKey,
  queryKeyStart: string
) => {
  const queryStart = getFreshQueryKeyStart(queryKey);

  return Boolean(queryKeyStart && queryStart.startsWith(queryKeyStart));
};

export const shouldConsumeFreshQuerySource = (
  mark: PeekedFreshQueryMark | null,
  source: FreshnessSource,
  {
    asOfLevel,
    cacheBypass,
  }: {
    asOfLevel?: number;
    cacheBypass: CacheBypassState;
  }
) => {
  if (!mark) {
    return false;
  }

  if (!mark.sources.includes(source)) {
    return false;
  }

  if (cacheBypass === "stale-fallback" || cacheBypass === "unknown") {
    return false;
  }

  const markLevel = mark.levels[source];

  if (markLevel !== undefined && asOfLevel === undefined) {
    return false;
  }

  if (
    markLevel !== undefined &&
    asOfLevel !== undefined &&
    asOfLevel < markLevel
  ) {
    return false;
  }

  return true;
};

export const parseCacheBypassState = (value: unknown): CacheBypassState => {
  if (Array.isArray(value)) {
    return parseCacheBypassState(value[0]);
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim().toLowerCase();

  if (
    normalizedValue === "fresh" ||
    normalizedValue === "limited" ||
    normalizedValue === "stale-fallback" ||
    normalizedValue === "unknown"
  ) {
    return normalizedValue;
  }

  return null;
};

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const hasRecordField = (value: unknown, key: string) =>
  isRecord(value) && isRecord(value[key]);
