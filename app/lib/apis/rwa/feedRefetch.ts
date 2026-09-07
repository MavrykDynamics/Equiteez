import type { QueryClient } from "@tanstack/react-query";

import { markEventKnown } from "~/lib/apis/rwa/fresh";
import { walletOpenOrdersQueryKeys } from "~/lib/apis/rwa/orders/orders";

type InvalidateWalletOpenOrdersParams = {
  level?: number | null;
  tokenAddress?: string | null;
  walletAddress: string;
};

const OPEN_ORDERS_QUERY_WALLET_INDEX = 1;
const OPEN_ORDERS_QUERY_TOKEN_INDEX = 5;

const normalizeAddress = (value: string) => value.trim().toLowerCase();

const getQueryKeyStringPart = (queryKey: readonly unknown[], index: number) => {
  const value = queryKey[index];

  return typeof value === "string" ? value : "";
};

const isWalletOpenOrdersQueryKey = (queryKey: readonly unknown[]) =>
  queryKey[0] === walletOpenOrdersQueryKeys.all[0];

const shouldInvalidateWalletOpenOrdersQuery = (
  queryKey: readonly unknown[],
  { tokenAddress, walletAddress }: InvalidateWalletOpenOrdersParams
) => {
  if (!isWalletOpenOrdersQueryKey(queryKey)) {
    return false;
  }

  const queryWalletAddress = getQueryKeyStringPart(
    queryKey,
    OPEN_ORDERS_QUERY_WALLET_INDEX
  );

  if (
    walletAddress &&
    queryWalletAddress &&
    normalizeAddress(queryWalletAddress) !== normalizeAddress(walletAddress)
  ) {
    return false;
  }

  if (!tokenAddress) {
    return true;
  }

  const queryTokenAddress = getQueryKeyStringPart(
    queryKey,
    OPEN_ORDERS_QUERY_TOKEN_INDEX
  );

  return (
    !queryTokenAddress ||
    normalizeAddress(queryTokenAddress) === normalizeAddress(tokenAddress)
  );
};

export const invalidateWalletOpenOrdersQueries = (
  queryClient: QueryClient,
  params: InvalidateWalletOpenOrdersParams
) => {
  if (params.walletAddress) {
    markEventKnown(
      {
        tokenAddress: params.tokenAddress,
        walletAddress: params.walletAddress,
      },
      { level: params.level }
    );
  }

  return queryClient.invalidateQueries(
    {
      predicate: (query) =>
        shouldInvalidateWalletOpenOrdersQuery(query.queryKey, params),
    },
    { cancelRefetch: true }
  );
};
