import type { QueryKey, UseQueryOptions } from "@tanstack/react-query";
import type { AxiosInstance, AxiosRequestConfig } from "axios";
import { FreshnessSource } from "~/lib/apis/rwa/freshness/constants";

export type FreshQueryKeyStartInput = string | QueryKey;

export type FreshnessSourceMap<T> = {
  [FreshnessSource.Orderbook]?: T;
  [FreshnessSource.Chain]?: T;
};

export type FreshnessAsOfSource = {
  level: number;
  timestamp: string;
  realtime: boolean;
};

export type FreshnessAsOf = FreshnessSourceMap<FreshnessAsOfSource>;

export type FreshQueryMarkInput = {
  source: FreshnessSource;
  level?: number | null;
};

export type FreshQuerySourceMark = {
  createdAt: number;
  level?: number;
};

export type FreshQueryMark = {
  [Source in FreshnessSource]?: FreshQuerySourceMark;
};

export type PeekedFreshQueryMark = {
  keysBySource: FreshnessSourceMap<string[]>;
  levels: FreshnessSourceMap<number>;
  sources: FreshnessSource[];
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
  asOfLevels: FreshnessSourceMap<number>;
  cacheBypass: CacheBypassState;
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
