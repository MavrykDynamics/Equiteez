import { useEffect, useMemo } from "react";
import { ALL_OPEN_ORDERS_QUERY } from "~/lib/apis/queries/openOrders.query";
import {
  OpenOrder,
  OpenOrdersQueryData,
  OpenOrdersQuerySchema,
  OpenOrdersQueryVariables,
} from "./openOrders.schema";
import { useApolloContext } from "~/providers/ApolloProvider/apollo.provider";
import { useToasterContext } from "~/providers/ToasterProvider/toaster.provider";
import { useQueryWithRefetch } from "~/providers/ApolloProvider/hooks/useQueryWithRefetch";

const OPEN_ORDERS_OFFSET = 0;
const OPEN_ORDERS_REFETCH_INTERVAL = 10_000;
export const OPEN_ORDERS_FETCH_LIMIT = 20;
const EMPTY_OPEN_ORDERS = {
  buyOrders: [],
  sellOrders: [],
} satisfies {
  buyOrders: OpenOrder[];
  sellOrders: OpenOrder[];
};

type UseOpenOrdersParams = {
  enabled?: boolean;
  limit?: number;
  orderbookAddress?: string | null;
  rwaAddress?: string | null;
};

const getOpenOrdersLimit = (limit?: number) => {
  if (limit === undefined) return OPEN_ORDERS_FETCH_LIMIT;
  if (!Number.isFinite(limit) || limit < 0) return OPEN_ORDERS_FETCH_LIMIT;

  return Math.min(Math.trunc(limit), OPEN_ORDERS_FETCH_LIMIT);
};

export function useOpenOrders({
  enabled = true,
  limit,
  orderbookAddress,
  rwaAddress,
}: UseOpenOrdersParams) {
  const { handleApolloError } = useApolloContext();
  const { warning } = useToasterContext();

  const queryVariables = useMemo<OpenOrdersQueryVariables>(
    () => ({
      limit: getOpenOrdersLimit(limit),
      orderbookAddress,
      rwaAddress,
      offset: OPEN_ORDERS_OFFSET,
    }),
    [limit, orderbookAddress, rwaAddress]
  );

  const openOrdersData = useQueryWithRefetch<
    OpenOrdersQueryData,
    OpenOrdersQueryVariables
  >(
    ALL_OPEN_ORDERS_QUERY,
    {
      variables: queryVariables,
      skip: !enabled || !orderbookAddress || !rwaAddress,
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

    handleApolloError(openOrdersData.error, "ALL_OPEN_ORDERS_QUERY");
    warning("Unable to fetch open orders", openOrdersData.error.message);
  }, [handleApolloError, openOrdersData.error, warning]);

  useEffect(() => {
    if (!parsedData || parsedData.success) return;

    warning("Unable to parse open orders", parsedData.error.message);
  }, [parsedData, warning]);

  const hasOrdersData = Boolean(parsedData?.success);
  const openOrders: OpenOrdersQueryData = parsedData?.success
    ? parsedData.data
    : EMPTY_OPEN_ORDERS;

  return {
    openOrders,
    loading: openOrdersData.loading && !hasOrdersData,
    isRefreshing: openOrdersData.loading && hasOrdersData,
  };
}
