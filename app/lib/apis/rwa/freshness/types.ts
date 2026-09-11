import type { QueryKey, UseQueryOptions } from "@tanstack/react-query";
import type { AxiosInstance, AxiosRequestConfig } from "axios";
import type { FreshnessSource } from "~/lib/apis/rwa/freshness/constants";

export type FreshQueryKeyStartInput = string | QueryKey;

export type FreshnessAsOfSource = {
  level: number;
  timestamp: string;
  realtime: boolean;
};

export type FreshnessAsOf = Partial<
  Record<FreshnessSource, FreshnessAsOfSource>
>;

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
  keysBySource: Partial<Record<FreshnessSource, string[]>>;
  levels: Partial<Record<FreshnessSource, number>>;
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
  asOfLevels: Partial<Record<FreshnessSource, number>>;
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
