import { useEffect, useMemo } from "react";

import { ORDERBOOK_LAST_TRADES_QUERY } from "~/lib/apis/queries/orderbookLastTrades.query";
import { useQueryWithRefetch } from "~/providers/ApolloProvider/hooks/useQueryWithRefetch";
import { useApolloContext } from "~/providers/ApolloProvider/apollo.provider";
import { useToasterContext } from "~/providers/ToasterProvider/toaster.provider";

import { OrderbookLastTradesQuerySchema } from "./orderbookLastTrades.schema";
import type {
  OrderbookLastTradeEvent,
  OrderbookLastTradesQueryData,
  OrderbookLastTradesQueryVariables,
} from "./orderbookLastTrades.schema";

const ORDERBOOK_LAST_TRADES_REFETCH_INTERVAL = 3_000;
const EMPTY_LAST_TRADES = {
  tradeEvents: [],
} satisfies {
  tradeEvents: OrderbookLastTradeEvent[];
};

type UseOrderbookLastTradesParams = {
  enabled?: boolean;
  limit?: number;
  rwaAddress?: string | null;
};

export function useOrderbookLastTrades({
  enabled = true,
  limit,
  rwaAddress,
}: UseOrderbookLastTradesParams) {
  const { handleApolloError } = useApolloContext();
  const { warning } = useToasterContext();

  const queryVariables = useMemo<OrderbookLastTradesQueryVariables>(
    () => ({
      limit: limit ? limit * 2 : undefined,
      rwaAddress,
    }),
    [limit, rwaAddress]
  );

  const tradesData = useQueryWithRefetch<
    OrderbookLastTradesQueryData,
    OrderbookLastTradesQueryVariables
  >(
    ORDERBOOK_LAST_TRADES_QUERY,
    {
      variables: queryVariables,
      skip: !enabled || !rwaAddress,
    },
    {
      refetchInterval: ORDERBOOK_LAST_TRADES_REFETCH_INTERVAL,
      refetchQueryVariables: queryVariables,
    }
  );

  const parsedData = useMemo(() => {
    if (!tradesData.data) return null;

    return OrderbookLastTradesQuerySchema.safeParse(tradesData.data);
  }, [tradesData.data]);

  useEffect(() => {
    if (!tradesData.error) return;

    handleApolloError(tradesData.error, "ORDERBOOK_LAST_TRADES_QUERY");
    warning("Unable to fetch last trades", tradesData.error.message);
  }, [handleApolloError, tradesData.error, warning]);

  useEffect(() => {
    if (!parsedData || parsedData.success) return;

    warning("Unable to parse last trades", parsedData.error.message);
  }, [parsedData, warning]);

  const hasTradesData = Boolean(parsedData?.success);
  const lastTradeEvents = parsedData?.success
    ? parsedData.data
    : EMPTY_LAST_TRADES;

  return {
    isRefreshing: tradesData.loading && hasTradesData,
    lastTradeEvents,
    loading: tradesData.loading && !hasTradesData,
  };
}
