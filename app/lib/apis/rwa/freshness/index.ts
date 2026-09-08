import { useCallback } from "react";
import {
  useQuery,
  useQueryClient,
  type QueryClient,
  type QueryKey,
  type UseQueryOptions,
  type UseQueryResult,
} from "@tanstack/react-query";

const FRESHNESS_MARK_TTL_MS = 15_000;
const FRESHNESS_REFETCH_INTERVAL_MS = 2_000;

type FreshQueryKeyStartInput = string | QueryKey;

type FreshQueryMarkInput = {
  level?: number | null;
};

type FreshQueryMark = {
  createdAt: number;
  level?: number;
};

type PeekedFreshQueryMark = {
  keys: string[];
  level?: number;
};

type CacheBypassState =
  | "fresh"
  | "limited"
  | "stale-fallback"
  | "unknown"
  | null;

type FreshQueryRequest = {
  mark: PeekedFreshQueryMark | null;
  shouldRequestFresh: boolean;
};

type CompleteFreshQueryParams = {
  asOfLevel?: number;
  cacheBypass: CacheBypassState;
  hasAsOf: boolean;
};

type UseFreshQueryOptions<
  TQueryFnData,
  TError,
  TData,
  TQueryKey extends QueryKey,
> = UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> & {
  freshnessQueryKeyStart?: FreshQueryKeyStartInput;
  freshnessRefetchInterval?: number;
};

const freshQueryMarks = new Map<string, FreshQueryMark>();

const normalizeFreshQueryKeyStart = (queryKeyStart: string) =>
  queryKeyStart.trim();

const getFreshQueryKeyStart = (queryKeyStart: FreshQueryKeyStartInput) => {
  if (typeof queryKeyStart === "string") {
    return normalizeFreshQueryKeyStart(queryKeyStart);
  }

  const firstPart = queryKeyStart[0];

  return typeof firstPart === "string"
    ? normalizeFreshQueryKeyStart(firstPart)
    : "";
};

const isFreshQueryMatch = (queryKey: QueryKey, queryKeyStart: string) => {
  const queryStart = getFreshQueryKeyStart(queryKey);

  return Boolean(queryKeyStart && queryStart.startsWith(queryKeyStart));
};

const pruneExpiredFreshQueryMarks = (now = Date.now()) => {
  freshQueryMarks.forEach((mark, key) => {
    if (now - mark.createdAt > FRESHNESS_MARK_TTL_MS) {
      freshQueryMarks.delete(key);
    }
  });
};

const peekFreshQuery = (
  queryKeyStart: FreshQueryKeyStartInput
): PeekedFreshQueryMark | null => {
  const normalizedQueryKeyStart = getFreshQueryKeyStart(queryKeyStart);

  if (!normalizedQueryKeyStart) {
    return null;
  }

  pruneExpiredFreshQueryMarks();

  const matchedMarks: Array<[string, FreshQueryMark]> = [];

  freshQueryMarks.forEach((mark, markQueryKeyStart) => {
    if (normalizedQueryKeyStart.startsWith(markQueryKeyStart)) {
      matchedMarks.push([markQueryKeyStart, mark]);
    }
  });

  if (!matchedMarks.length) {
    return null;
  }

  const levels = matchedMarks
    .map(([, mark]) => mark.level)
    .filter((level): level is number => typeof level === "number");

  return {
    keys: matchedMarks.map(([markQueryKeyStart]) => markQueryKeyStart),
    level: levels.length ? Math.max(...levels) : undefined,
  };
};

const markFreshQuery = (
  queryKeyStart: FreshQueryKeyStartInput,
  mark: FreshQueryMarkInput = {}
) => {
  const normalizedQueryKeyStart = getFreshQueryKeyStart(queryKeyStart);

  if (!normalizedQueryKeyStart) {
    return;
  }

  const level =
    typeof mark.level === "number" && Number.isFinite(mark.level)
      ? mark.level
      : undefined;

  freshQueryMarks.set(normalizedQueryKeyStart, {
    createdAt: Date.now(),
    level,
  });
};

const consumeFreshQuery = (mark: PeekedFreshQueryMark | null) => {
  if (!mark) {
    return;
  }

  mark.keys.forEach((key) => freshQueryMarks.delete(key));
};

const keepFreshQueryAlive = (mark: PeekedFreshQueryMark | null) => {
  if (!mark) {
    return;
  }

  const now = Date.now();

  mark.keys.forEach((key) => {
    const currentMark = freshQueryMarks.get(key);

    if (currentMark) {
      freshQueryMarks.set(key, {
        ...currentMark,
        createdAt: now,
      });
    }
  });
};

const hasPendingFreshQuery = (queryKeyStart: FreshQueryKeyStartInput) =>
  Boolean(peekFreshQuery(queryKeyStart));

const shouldConsumeFreshQuery = (
  mark: PeekedFreshQueryMark | null,
  { asOfLevel, cacheBypass }: CompleteFreshQueryParams
) => {
  if (!mark) {
    return false;
  }

  if (cacheBypass === "stale-fallback" || cacheBypass === "unknown") {
    return false;
  }

  if (
    mark.level !== undefined &&
    asOfLevel !== undefined &&
    asOfLevel < mark.level
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

export const getFreshQueryRequest = (
  queryKeyStart: FreshQueryKeyStartInput,
  { enabled = true }: { enabled?: boolean } = {}
): FreshQueryRequest => {
  const mark = peekFreshQuery(queryKeyStart);

  return {
    mark,
    shouldRequestFresh: Boolean(mark) && enabled,
  };
};

export const completeFreshQuery = (
  request: FreshQueryRequest,
  { asOfLevel, cacheBypass, hasAsOf }: CompleteFreshQueryParams
) => {
  const canValidateFreshness =
    request.shouldRequestFresh ||
    (request.mark?.level !== undefined && hasAsOf);

  if (!canValidateFreshness) {
    return;
  }

  if (
    shouldConsumeFreshQuery(request.mark, {
      asOfLevel: hasAsOf ? asOfLevel : undefined,
      cacheBypass,
      hasAsOf,
    })
  ) {
    consumeFreshQuery(request.mark);
    return;
  }

  keepFreshQueryAlive(request.mark);
};

export const invalidateFreshQueries = (
  queryClient: QueryClient,
  {
    level,
    queryKeyStart,
  }: FreshQueryMarkInput & { queryKeyStart: FreshQueryKeyStartInput }
) => {
  const normalizedQueryKeyStart = getFreshQueryKeyStart(queryKeyStart);

  markFreshQuery(normalizedQueryKeyStart, { level });

  return queryClient.invalidateQueries(
    {
      predicate: (query) =>
        isFreshQueryMatch(query.queryKey, normalizedQueryKeyStart),
    },
    { cancelRefetch: true }
  );
};

export const useFreshQueryInvalidation = () => {
  const queryClient = useQueryClient();

  return useCallback(
    (queryKeyStart: FreshQueryKeyStartInput, mark?: FreshQueryMarkInput) =>
      invalidateFreshQueries(queryClient, {
        level: mark?.level,
        queryKeyStart,
      }),
    [queryClient]
  );
};

export function useFreshQuery<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>({
  freshnessQueryKeyStart,
  freshnessRefetchInterval = FRESHNESS_REFETCH_INTERVAL_MS,
  refetchInterval,
  ...options
}: UseFreshQueryOptions<
  TQueryFnData,
  TError,
  TData,
  TQueryKey
>): UseQueryResult<TData, TError> {
  const queryKeyStart = freshnessQueryKeyStart ?? options.queryKey;

  return useQuery({
    ...options,
    refetchInterval: (query) => {
      if (hasPendingFreshQuery(queryKeyStart)) {
        return freshnessRefetchInterval;
      }

      if (typeof refetchInterval === "function") {
        return refetchInterval(query);
      }

      return refetchInterval;
    },
  });
}
