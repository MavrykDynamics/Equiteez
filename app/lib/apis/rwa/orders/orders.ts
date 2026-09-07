import { rwaApi } from "~/lib/apis/rwa/client";
import {
  OpenOrdersSchema,
  OrderHistorySchema,
  TransferHistorySchema,
} from "~/lib/apis/rwa/orders/orders.schema";
import {
  OpenOrdersResponseType,
  OrderHistoryResponseType,
  TransferHistoryResponseType,
  WalletTransferHistoryParams,
} from "~/lib/apis/rwa/orders/orders.types";
import {
  consumeEventKnown,
  type CacheBypassState,
  peekEventKnown,
  shouldConsumeEventKnown,
} from "~/lib/apis/rwa/fresh";

type WalletOpenOrdersParams = {
  walletAddress: string;
  page?: number;
  perPage?: number;
  search?: string;
  sort?: string;
  tokenAddress?: string;
};

type WalletOpenOrdersQueryKeyParams = Pick<
  WalletOpenOrdersParams,
  "page" | "search" | "sort" | "tokenAddress" | "walletAddress"
>;

type WalletOrdersParams = {
  walletAddress: string;
  page?: number;
  perPage?: number;
  search?: string;
  sort?: string;
  tokenAddress?: string;
};

export const walletOpenOrdersQueryKeys = {
  all: ["fetchWalletOpenOrders"] as const,
  list: ({
    page,
    search,
    sort,
    tokenAddress,
    walletAddress,
  }: WalletOpenOrdersQueryKeyParams) =>
    [
      ...walletOpenOrdersQueryKeys.all,
      walletAddress,
      search ?? "",
      sort ?? "",
      page,
      tokenAddress,
    ] as const,
};

const parseCacheBypassState = (value: unknown): CacheBypassState => {
  if (Array.isArray(value)) {
    return parseCacheBypassState(value[0]);
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim().toLowerCase();

  if (
    normalizedValue === "fresh" ||
    normalizedValue === "limited" ||
    normalizedValue === "stale-fallback" ||
    normalizedValue === "unknown"
  ) {
    return normalizedValue;
  }

  return null;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const hasAsOfMarker = (value: unknown) =>
  isRecord(value) && isRecord(value.as_of);

export const fetchWalletOpenOrders = async ({
  walletAddress,
  page,
  perPage,
  search,
  sort,
  tokenAddress,
}: WalletOpenOrdersParams): Promise<OpenOrdersResponseType> => {
  const query = new URLSearchParams();
  const freshnessMark = peekEventKnown({ tokenAddress, walletAddress });
  const shouldRequestFresh = Boolean(freshnessMark) && (!page || page === 1);

  if (page) {
    query.set("page", String(page));
  }

  if (perPage) {
    query.set("per_page", String(perPage));
  }

  if (search) {
    query.set("search", search);
  }

  if (sort) {
    query.set("sort", sort);
  }

  if (tokenAddress) {
    query.set("token_address", tokenAddress);
  }

  query.set("status", "open,expired");
  query.set("refund", "none,claimable");

  if (shouldRequestFresh) {
    query.set("fresh", "1");
  }

  const queryString = query.toString();
  const url = `/wallets/${walletAddress}/orders${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await rwaApi.get(url);
  const hasResponseAsOf = hasAsOfMarker(response.data);
  const parsedData = OpenOrdersSchema.parse(response.data);
  const cacheBypass = parseCacheBypassState(response.headers["x-cache-bypass"]);

  if (
    shouldRequestFresh &&
    shouldConsumeEventKnown({
      asOfLevel: hasResponseAsOf ? parsedData.as_of.level : undefined,
      cacheBypass,
      mark: freshnessMark,
    })
  ) {
    consumeEventKnown(freshnessMark);
  }

  return parsedData;
};

export const fetchWalletOrderHistory = async ({
  walletAddress,
  page,
  perPage,
  search,
  sort,
  tokenAddress,
}: WalletOrdersParams): Promise<OrderHistoryResponseType> => {
  const query = new URLSearchParams();

  if (page) {
    query.set("page", String(page));
  }

  if (perPage) {
    query.set("per_page", String(perPage));
  }

  if (search) {
    query.set("search", search);
  }

  if (sort) {
    query.set("sort", sort);
  }

  if (tokenAddress) {
    query.set("token_address", tokenAddress);
  }

  ["limit_sell", "limit_buy", "market_buy", "market_sell"].forEach((type) =>
    query.append("types", type)
  );

  const { data } = await rwaApi.get(
    `/wallets/${walletAddress}/transactions?${query.toString()}`
  );

  return OrderHistorySchema.parse(data);
};

export const fetchWalletTransferHistory = async ({
  walletAddress,
  page,
  perPage,
  search,
  sort,
  tokenAddress,
}: WalletTransferHistoryParams): Promise<TransferHistoryResponseType> => {
  const query = new URLSearchParams();

  if (page) {
    query.set("page", String(page));
  }

  if (perPage) {
    query.set("per_page", String(perPage));
  }

  if (search) {
    query.set("search", search);
  }

  if (sort) {
    query.set("sort", sort);
  }

  if (tokenAddress) {
    query.set("token_address", tokenAddress);
  }

  ["deposit", "withdrawal"].forEach((type) => query.append("types", type));

  const { data } = await rwaApi.get(
    `/wallets/${walletAddress}/transactions?${query.toString()}`
  );

  return TransferHistorySchema.parse(data);
};
