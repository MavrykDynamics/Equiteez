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
const OPEN_ORDERS_REFETCH_INTERVAL = 30_000;
const EMPTY_OPEN_ORDERS = {
  buyOrders: [],
  sellOrders: [],
} satisfies {
  buyOrders: OpenOrder[];
  sellOrders: OpenOrder[];
};

type UseOpenOrdersParams = {
  enabled?: boolean;
  rwaAddress?: string | null;
};

export function useOpenOrders({
  enabled = true,
  rwaAddress,
}: UseOpenOrdersParams) {
  const { handleApolloError } = useApolloContext();
  const { warning } = useToasterContext();

  const queryVariables = useMemo<OpenOrdersQueryVariables>(
    () => ({
      rwaAddress,
      offset: OPEN_ORDERS_OFFSET,
    }),
    [rwaAddress]
  );

  const openOrdersData = useQueryWithRefetch<
    OpenOrdersQueryData,
    OpenOrdersQueryVariables
  >(
    ALL_OPEN_ORDERS_QUERY,
    {
      variables: queryVariables,
      skip: !enabled || !rwaAddress,
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
