import { useEffect, useMemo } from "react";
import { BigNumber } from "bignumber.js";

import { OPEN_ORDERS_BY_RWA_ADDRESSES_QUERY } from "~/lib/apis/queries/openOrders.query";
import { OpenOrdersQuerySchema } from "~/lib/apis/mbrwa/openOrders/openOrders.schema";
import type {
  OpenOrder,
  OpenOrdersByRwaAddressesQueryVariables,
  OpenOrdersQueryData,
} from "~/lib/apis/mbrwa/openOrders/openOrders.schema";
import { STABLECOIN_ASSET_SLUG } from "~/lib/metadata";
import { useTokensContext } from "~/providers/TokensProvider/tokens.provider";
import { useApolloContext } from "~/providers/ApolloProvider/apollo.provider";
import { useQueryWithRefetch } from "~/providers/ApolloProvider/hooks/useQueryWithRefetch";
import { useToasterContext } from "~/providers/ToasterProvider/toaster.provider";
import { useDexContext } from "~/providers/Dexprovider/dex.provider";
import {
  DEFAULT_QUOTE_TOKEN_DECIMALS,
  getCurrentPriceFromOpenOrders,
} from "~/providers/Dexprovider/utils";
import type { EstateType } from "~/providers/MarketsProvider/market.types";

const OPEN_ORDERS_REFETCH_INTERVAL = 10_000;
const EMPTY_OPEN_ORDERS: OpenOrdersQueryData = {
  buyOrders: [],
  sellOrders: [],
};

type UseOrderbookCurrentPricesParams = {
  assets: EstateType[];
  enabled?: boolean;
};

const getRwaAddress = (order: OpenOrder) => order.orderbook.rwa_token.address;

const groupOpenOrdersByRwaAddress = (
  openOrders: OpenOrdersQueryData
): Record<string, OpenOrdersQueryData> => {
  const openOrdersByRwaAddress: Record<string, OpenOrdersQueryData> = {};

  const getOrCreateOrders = (rwaAddress: string) => {
    openOrdersByRwaAddress[rwaAddress] ??= {
      buyOrders: [],
      sellOrders: [],
    };

    return openOrdersByRwaAddress[rwaAddress];
  };

  openOrders.buyOrders.forEach((order) => {
    getOrCreateOrders(getRwaAddress(order)).buyOrders.push(order);
  });

  openOrders.sellOrders.forEach((order) => {
    getOrCreateOrders(getRwaAddress(order)).sellOrders.push(order);
  });

  return openOrdersByRwaAddress;
};

export function useOrderbookCurrentPrices({
  assets,
  enabled = true,
}: UseOrderbookCurrentPricesParams) {
  const { handleApolloError } = useApolloContext();
  const { warning } = useToasterContext();
  const { orderbookTokenPair } = useDexContext();
  const { tokensMetadata } = useTokensContext();

  const rwaAddresses = useMemo(
    () =>
      Array.from(new Set(assets.map((asset) => asset.token_address))).filter(
        Boolean
      ),
    [assets]
  );

  const queryVariables = useMemo<OpenOrdersByRwaAddressesQueryVariables>(
    () => ({ rwaAddresses }),
    [rwaAddresses]
  );

  const openOrdersData = useQueryWithRefetch<
    OpenOrdersQueryData,
    OpenOrdersByRwaAddressesQueryVariables
  >(
    OPEN_ORDERS_BY_RWA_ADDRESSES_QUERY,
    {
      variables: queryVariables,
      skip: !enabled || rwaAddresses.length === 0,
    },
    {
      refetchInterval: OPEN_ORDERS_REFETCH_INTERVAL,
      refetchQueryVariables: queryVariables,
    }
  );

  const parsedData = useMemo(() => {
    if (!openOrdersData.data) return null;

    return OpenOrdersQuerySchema.safeParse(openOrdersData.data);
  }, [openOrdersData.data]);

  useEffect(() => {
    if (!openOrdersData.error) return;

    handleApolloError(
      openOrdersData.error,
      "OPEN_ORDERS_BY_RWA_ADDRESSES_QUERY"
    );
    warning("Unable to fetch open order prices", openOrdersData.error.message);
  }, [handleApolloError, openOrdersData.error, warning]);

  useEffect(() => {
    if (!parsedData || parsedData.success) return;

    warning("Unable to parse open order prices", parsedData.error.message);
  }, [parsedData, warning]);

  const hasOrdersData = Boolean(parsedData?.success);
  const openOrders = parsedData?.success ? parsedData.data : EMPTY_OPEN_ORDERS;

  const openOrdersByRwaAddress = useMemo(
    () => groupOpenOrdersByRwaAddress(openOrders),
    [openOrders]
  );

  const pricesByAssetSlug = useMemo(
    () =>
      assets.reduce<Record<string, BigNumber>>((acc, asset) => {
        const quoteTokenSlug =
          orderbookTokenPair[asset.slug] ?? STABLECOIN_ASSET_SLUG;
        const quoteTokenDecimals =
          tokensMetadata[quoteTokenSlug]?.decimals ??
          DEFAULT_QUOTE_TOKEN_DECIMALS;
        const assetOpenOrders =
          openOrdersByRwaAddress[asset.token_address] ?? EMPTY_OPEN_ORDERS;
        const currentPrice = getCurrentPriceFromOpenOrders({
          buyOrders: assetOpenOrders.buyOrders,
          sellOrders: assetOpenOrders.sellOrders,
          quoteTokenDecimals,
        });

        acc[asset.slug] = currentPrice.gt(0)
          ? currentPrice
          : new BigNumber(asset.assetDetails.priceDetails.price);

        return acc;
      }, {}),
    [assets, openOrdersByRwaAddress, orderbookTokenPair, tokensMetadata]
  );

  return {
    pricesByAssetSlug,
    loading: openOrdersData.loading && !hasOrdersData,
    isRefreshing: openOrdersData.loading && hasOrdersData,
  };
}
