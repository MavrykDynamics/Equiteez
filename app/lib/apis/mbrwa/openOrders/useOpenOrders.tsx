import { useEffect, useMemo } from "react";
import { useQuery } from "@apollo/client/index";
import { ALL_OPEN_ORDERS_QUERY } from "~/lib/apis/queries/openOrders.query";
import {
  OpenOrder,
  OpenOrdersQueryData,
  OpenOrdersQuerySchema,
  OpenOrdersQueryVariables,
} from "./openOrders.schema";
import { useApolloContext } from "~/providers/ApolloProvider/apollo.provider";
import { useToasterContext } from "~/providers/ToasterProvider/toaster.provider";

export const OPEN_ORDERS_LIMIT = 10;
const OPEN_ORDERS_OFFSET = 0;

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

  const openOrdersData = useQuery<OpenOrdersQueryData, OpenOrdersQueryVariables>(
    ALL_OPEN_ORDERS_QUERY,
    {
      variables: {
        rwaAddress,
        offset: OPEN_ORDERS_OFFSET,
        limit: OPEN_ORDERS_LIMIT,
      },
      skip: !enabled || !rwaAddress,
      notifyOnNetworkStatusChange: true,
      fetchPolicy: "network-only",
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

  return {
    openOrders: parsedData?.success
      ? parsedData.data
      : ({
          buyOrders: [],
          sellOrders: [],
        } satisfies {
          buyOrders: OpenOrder[];
          sellOrders: OpenOrder[];
        }),
    loading: openOrdersData.loading,
  };
}
