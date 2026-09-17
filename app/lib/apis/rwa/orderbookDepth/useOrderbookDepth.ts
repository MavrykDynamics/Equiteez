import { useEffect, useMemo } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { unknownToError } from "~/errors/error";
import {
  DEFAULT_ORDERBOOK_DEPTH_LIMIT,
  ORDERBOOK_DEPTH_REFETCH_INTERVAL,
  fetchOrderbookDepth,
  orderbookDepthQueryKeys,
} from "~/lib/apis/rwa/orderbookDepth/orderbookDepth";
import type { FetchOrderbookDepthParams } from "~/lib/apis/rwa/orderbookDepth/orderbookDepth.types";
import { useToasterContext } from "~/providers/ToasterProvider/toaster.provider";

type UseOrderbookDepthParams = Partial<
  Omit<FetchOrderbookDepthParams, "tokenAddress">
> & {
  enabled?: boolean;
  refetchInterval?: number;
  tokenAddress?: string | null;
};

export function useOrderbookDepth({
  depth,
  enabled = true,
  groupBy = 0,
  limit = DEFAULT_ORDERBOOK_DEPTH_LIMIT,
  offset = 0,
  ratioDepth,
  refetchInterval = ORDERBOOK_DEPTH_REFETCH_INTERVAL,
  tokenAddress,
}: UseOrderbookDepthParams) {
  const { warning } = useToasterContext();
  const queryParams = useMemo<FetchOrderbookDepthParams>(
    () => ({
      depth,
      groupBy,
      limit,
      offset,
      ratioDepth,
      tokenAddress: tokenAddress ?? "",
    }),
    [depth, groupBy, limit, offset, ratioDepth, tokenAddress]
  );

  const depthQuery = useQuery({
    enabled: enabled && Boolean(tokenAddress),
    placeholderData: keepPreviousData,
    queryFn: () => fetchOrderbookDepth(queryParams),
    queryKey: orderbookDepthQueryKeys.detail(queryParams),
    refetchInterval,
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    if (!depthQuery.error) return;

    const err = unknownToError(depthQuery.error);

    warning("Unable to fetch orderbook depth", err.message);
  }, [depthQuery.error, warning]);

  const hasDepthData = Boolean(depthQuery.data);

  return {
    error: depthQuery.error,
    isRefreshing: depthQuery.isFetching && hasDepthData,
    loading:
      (depthQuery.isLoading || depthQuery.isPending) && !hasDepthData,
    orderbookDepth: depthQuery.data ?? null,
    refetch: depthQuery.refetch,
  };
}
