import { useCallback } from "react";
import {
  useQuery,
  useQueryClient,
  type QueryClient,
  type QueryKey,
  type UseQueryResult,
} from "@tanstack/react-query";

import { FRESHNESS_REFETCH_INTERVAL_MS } from "~/lib/apis/rwa/freshness/constants";
import {
  getFreshQueryKeyStart,
  isFreshQueryMatch,
} from "~/lib/apis/rwa/freshness/helpers";
import {
  hasPendingFreshQuery,
  markFreshQuery,
} from "~/lib/apis/rwa/freshness/store";
import type {
  FreshQueryKeyStartInput,
  FreshQueryMarkInput,
  UseFreshQueryOptions,
} from "~/lib/apis/rwa/freshness/types";

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
