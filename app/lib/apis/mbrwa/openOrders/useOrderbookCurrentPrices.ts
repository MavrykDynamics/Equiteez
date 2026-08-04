import { useEffect, useMemo } from "react";
import { keepPreviousData, useQueries } from "@tanstack/react-query";
import { BigNumber } from "bignumber.js";

import { unknownToError } from "~/errors/error";
import {
  ORDERBOOK_DEPTH_REFETCH_INTERVAL,
  fetchOrderbookDepth,
  orderbookDepthQueryKeys,
} from "~/lib/apis/rwa";
import type { OrderbookDepthResponseType } from "~/lib/apis/rwa/orderbookDepth/orderbookDepth.types";
import { useToasterContext } from "~/providers/ToasterProvider/toaster.provider";
import {
  DEFAULT_QUOTE_TOKEN_DECIMALS,
  getCurrentPriceFromOrderbookDepth,
} from "~/providers/Dexprovider/utils";
import type { EstateType } from "~/providers/MarketsProvider/market.types";

const ORDERBOOK_CURRENT_PRICE_DEPTH_LIMIT = 1;

type UseOrderbookCurrentPricesParams = {
  assets: EstateType[];
  enabled?: boolean;
};

export function useOrderbookCurrentPrices({
  assets,
  enabled = true,
}: UseOrderbookCurrentPricesParams) {
  const { warning } = useToasterContext();

  const rwaAddresses = useMemo(
    () =>
      Array.from(new Set(assets.map((asset) => asset.token_address))).filter(
        Boolean
      ),
    [assets]
  );

  const depthQueries = useQueries({
    queries: rwaAddresses.map((tokenAddress) => ({
      enabled,
      placeholderData: keepPreviousData,
      queryFn: () =>
        fetchOrderbookDepth({
          groupBy: 0,
          limit: ORDERBOOK_CURRENT_PRICE_DEPTH_LIMIT,
          offset: 0,
          tokenAddress,
        }),
      queryKey: orderbookDepthQueryKeys.detail({
        groupBy: 0,
        limit: ORDERBOOK_CURRENT_PRICE_DEPTH_LIMIT,
        offset: 0,
        tokenAddress,
      }),
      refetchInterval: ORDERBOOK_DEPTH_REFETCH_INTERVAL,
      refetchIntervalInBackground: true,
    })),
  });

  const firstError = depthQueries.find((query) => query.error)?.error;

  useEffect(() => {
    if (!firstError) return;

    const err = unknownToError(firstError);

    warning("Unable to fetch orderbook prices", err.message);
  }, [firstError, warning]);

  const depthByRwaAddress = useMemo(
    () =>
      rwaAddresses.reduce<Record<string, OrderbookDepthResponseType | null>>(
        (acc, rwaAddress, index) => {
          acc[rwaAddress] = depthQueries[index]?.data ?? null;

          return acc;
        },
        {}
      ),
    [depthQueries, rwaAddresses]
  );

  const pricesByAssetSlug = useMemo(
    () =>
      assets.reduce<Record<string, BigNumber>>((acc, asset) => {
        const orderbookDepth = depthByRwaAddress[asset.token_address] ?? null;
        const currentPrice = getCurrentPriceFromOrderbookDepth({
          orderbookDepth,
          quoteTokenDecimals:
            orderbookDepth?.quote_token.decimals ?? DEFAULT_QUOTE_TOKEN_DECIMALS,
        });

        acc[asset.slug] = currentPrice.gt(0)
          ? currentPrice
          : new BigNumber(asset.assetDetails.priceDetails.price);

        return acc;
      }, {}),
    [assets, depthByRwaAddress]
  );

  return {
    isRefreshing: depthQueries.some(
      (query) => query.isFetching && Boolean(query.data)
    ),
    loading: depthQueries.some(
      (query) => (query.isLoading || query.isPending) && !query.data
    ),
    pricesByAssetSlug,
  };
}
