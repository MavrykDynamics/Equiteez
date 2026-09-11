import type { AxiosResponse } from "axios";

import { FRESHNESS_SOURCES } from "~/lib/apis/rwa/freshness/constants";
import {
  isRecord,
  parseCacheBypassState,
} from "~/lib/apis/rwa/freshness/helpers";
import {
  completeFreshQuery,
  getFreshQueryRequest,
} from "~/lib/apis/rwa/freshness/store";
import type {
  FreshnessSource,
  FreshRequestParams,
} from "~/lib/apis/rwa/freshness/types";

const getResponseAsOfLevels = (value: unknown) => {
  const levels: Partial<Record<FreshnessSource, number>> = {};

  if (!isRecord(value)) {
    return levels;
  }

  const asOf = value.as_of;

  if (!isRecord(asOf)) {
    return levels;
  }

  FRESHNESS_SOURCES.forEach((source) => {
    const sourceAsOf = asOf[source];

    if (isRecord(sourceAsOf) && typeof sourceAsOf.level === "number") {
      levels[source] = sourceAsOf.level;
    }
  });

  return levels;
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
  const asOfLevels = getResponseAsOfLevels(response.data);

  completeFreshQuery(freshQuery, {
    asOfLevels,
    cacheBypass: parseCacheBypassState(response.headers["x-cache-bypass"]),
  });

  return response;
}
