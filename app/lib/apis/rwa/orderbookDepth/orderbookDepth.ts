import { rwaApi } from "~/lib/apis/rwa/client";
import { OrderbookDepthSchema } from "~/lib/apis/rwa/orderbookDepth/orderbookDepth.schema";
import type {
  FetchOrderbookDepthParams,
  OrderbookDepthResponseType,
} from "~/lib/apis/rwa/orderbookDepth/orderbookDepth.types";

export const DEFAULT_ORDERBOOK_DEPTH_LIMIT = 50;
export const MAX_ORDERBOOK_DEPTH_LIMIT = 100;
export const ORDERBOOK_DEPTH_REFETCH_INTERVAL = 10_000;

const setOptionalQueryParam = (
  query: URLSearchParams,
  key: string,
  value: number | undefined
) => {
  if (value === undefined) return;

  query.set(key, String(value));
};

export const orderbookDepthQueryKeys = {
  all: ["rwa-orderbook-depth"] as const,
  detail: ({
    depth,
    groupBy,
    limit,
    offset,
    ratioDepth,
    tokenAddress,
  }: FetchOrderbookDepthParams) =>
    [
      ...orderbookDepthQueryKeys.all,
      tokenAddress,
      { depth, groupBy, limit, offset, ratioDepth },
    ] as const,
};

export const fetchOrderbookDepth = async ({
  depth,
  groupBy,
  limit,
  offset,
  ratioDepth,
  tokenAddress,
}: FetchOrderbookDepthParams): Promise<OrderbookDepthResponseType> => {
  if (!tokenAddress) {
    throw new Error("Orderbook depth token address is required");
  }

  const query = new URLSearchParams();

  setOptionalQueryParam(query, "limit", limit);
  setOptionalQueryParam(query, "offset", offset);
  setOptionalQueryParam(query, "depth", depth);
  setOptionalQueryParam(query, "group_by", groupBy);
  setOptionalQueryParam(query, "ratio_depth", ratioDepth);

  const queryString = query.toString();
  const url = `/assets/${encodeURIComponent(tokenAddress)}/orderbook${
    queryString ? `?${queryString}` : ""
  }`;
  const { data } = await rwaApi.get(url);

  return OrderbookDepthSchema.parse(data);
};
