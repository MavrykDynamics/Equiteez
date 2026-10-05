import type { ApolloError } from "@apollo/client/index";
import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { basenetNetRpcnode } from "~/consts";
import { readOrderbookConfig } from "~/contracts/orderbookConfig";
import { ORDERBOOK_CONFIG_QUERY } from "~/lib/apis/queries/orderbookConfig.query";
import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import {
  normalizeOrderbookConfig,
  needsOrderbookContractConfig,
} from "~/lib/orderbook/orderbookConfig";
import { useApolloContext } from "~/providers/ApolloProvider/apollo.provider";
import { useQueryWithRefetch } from "~/providers/ApolloProvider/hooks/useQueryWithRefetch";

export function useOrderbookConfig(asset: AssetType) {
  const address = asset.orderbook?.address ?? "";
  const { handleApolloError } = useApolloContext();
  const query = useQueryWithRefetch(
    ORDERBOOK_CONFIG_QUERY,
    {
      variables: { address },
      skip: !address,
      onError: useCallback(
        (error: ApolloError) =>
          handleApolloError(error, "ORDERBOOK_CONFIG_QUERY"),
        [handleApolloError]
      ),
    },
    { refetchInterval: 30_000 }
  );
  const row = query.data?.orderbook.find((book) => book.address === address);
  const needsFallback = Boolean(row && needsOrderbookContractConfig(row));
  const fallback = useQuery({
    queryKey: ["orderbook-contract-config", basenetNetRpcnode, address],
    queryFn: () => readOrderbookConfig(address),
    enabled: needsFallback,
    staleTime: Infinity,
    retry: false,
    retryOnMount: false,
    refetchOnWindowFocus: false,
  });
  const result = useMemo(() => {
    if (!address)
      return {
        status: "unavailable" as const,
        error: new Error("This asset has no orderbook."),
      };
    if (query.error && !row)
      return { status: "error" as const, error: query.error };
    if (!row)
      return {
        status: query.loading ? ("loading" as const) : ("unavailable" as const),
        error: query.loading
          ? undefined
          : new Error("Orderbook configuration is unavailable."),
      };
    if (needsFallback && fallback.isPending)
      return { status: "loading" as const };
    if (needsFallback && fallback.error)
      return { status: "error" as const, error: fallback.error };
    try {
      return {
        status: query.error ? ("error" as const) : ("ready" as const),
        error: query.error,
        config: normalizeOrderbookConfig(asset, row, fallback.data),
      };
    } catch (error) {
      return {
        status: "unavailable" as const,
        error:
          error instanceof Error
            ? error
            : new Error("Invalid orderbook configuration."),
      };
    }
  }, [
    address,
    asset,
    row,
    query.error,
    query.loading,
    needsFallback,
    fallback.isPending,
    fallback.error,
    fallback.data,
  ]);
  const { refetch: refetchQuery } = query;
  const { refetch: refetchContract } = fallback;
  const retry = useCallback(async () => {
    if (!address) return;
    await refetchQuery();
    if (needsFallback) await refetchContract();
  }, [address, refetchQuery, refetchContract, needsFallback]);
  return { ...result, retry };
}
