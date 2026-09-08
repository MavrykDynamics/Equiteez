import type { AxiosResponse } from "axios";

import {
  isRecord,
  parseCacheBypassState,
} from "~/lib/apis/rwa/freshness/helpers";
import {
  completeFreshQuery,
  getFreshQueryRequest,
} from "~/lib/apis/rwa/freshness/store";
import type { FreshRequestParams } from "~/lib/apis/rwa/freshness/types";

const getResponseAsOfLevel = (value: unknown) => {
  if (!isRecord(value) || !isRecord(value.as_of)) {
    return undefined;
  }

  return typeof value.as_of.level === "number" ? value.as_of.level : undefined;
};

const getRequestUrl = ({
  shouldRequestFresh,
  query,
  url,
}: {
  query?: URLSearchParams;
  shouldRequestFresh: boolean;
  url: string;
}) => {
  const [pathname, search = ""] = url.split("?");
  const requestQuery = new URLSearchParams(search);

  query?.forEach((value, key) => {
    requestQuery.append(key, value);
  });

  if (shouldRequestFresh) {
    requestQuery.set("fresh", "1");
  }

  const queryString = requestQuery.toString();
  return queryString ? `${pathname}?${queryString}` : pathname;
};

export async function requestFreshQuery<TResponseData = unknown>({
  api,
  config,
  data,
  method = "get",
  query,
  queryKeyStart,
  url,
}: FreshRequestParams): Promise<AxiosResponse<TResponseData>> {
  const freshQuery = getFreshQueryRequest(queryKeyStart);
  const requestUrl = getRequestUrl({
    query,
    shouldRequestFresh: freshQuery.shouldRequestFresh,
    url,
  });

  const response =
    method === "get" || method === "delete"
      ? await api[method]<TResponseData>(requestUrl, config)
      : await api[method]<TResponseData>(requestUrl, data, config);
  const asOfLevel = getResponseAsOfLevel(response.data);

  completeFreshQuery(freshQuery, {
    asOfLevel,
    cacheBypass: parseCacheBypassState(response.headers["x-cache-bypass"]),
    hasAsOf: asOfLevel !== undefined,
  });

  return response;
}
