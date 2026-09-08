import type {
  QueryKey,
  UseQueryOptions,
} from "@tanstack/react-query";
import type {
  AxiosInstance,
  AxiosRequestConfig,
} from "axios";

export type FreshQueryKeyStartInput = string | QueryKey;

export type FreshQueryMarkInput = {
  level?: number | null;
};

export type FreshQueryMark = {
  createdAt: number;
  level?: number;
};

export type PeekedFreshQueryMark = {
  keys: string[];
  level?: number;
};

export type CacheBypassState =
  | "fresh"
  | "limited"
  | "stale-fallback"
  | "unknown"
  | null;

export type FreshQueryRequest = {
  mark: PeekedFreshQueryMark | null;
  shouldRequestFresh: boolean;
};

export type CompleteFreshQueryParams = {
  asOfLevel?: number;
  cacheBypass: CacheBypassState;
  hasAsOf: boolean;
};

export type UseFreshQueryOptions<
  TQueryFnData,
  TError,
  TData,
  TQueryKey extends QueryKey,
> = UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> & {
  freshnessQueryKeyStart?: FreshQueryKeyStartInput;
  freshnessRefetchInterval?: number;
};

export type FreshRequestMethod = "delete" | "get" | "patch" | "post" | "put";

export type FreshRequestApi = Pick<AxiosInstance, FreshRequestMethod>;

export type FreshRequestParams<TRequestData = unknown> = {
  api: FreshRequestApi;
  config?: AxiosRequestConfig;
  data?: TRequestData;
  method?: FreshRequestMethod;
  query?: URLSearchParams;
  queryKeyStart: FreshQueryKeyStartInput;
  url: string;
};
