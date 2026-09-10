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
import { requestFreshQuery } from "~/lib/apis/rwa/freshness";

type WalletOpenOrdersParams = {
  walletAddress: string;
  page?: number;
  perPage?: number;
  search?: string;
  sort?: string;
  tokenAddress?: string;
};

type WalletOrdersParams = {
  walletAddress: string;
  page?: number;
  perPage?: number;
  search?: string;
  sort?: string;
  tokenAddress?: string;
};

export const fetchWalletOpenOrders = async ({
  walletAddress,
  page,
  perPage,
  search,
  sort,
  tokenAddress,
}: WalletOpenOrdersParams): Promise<OpenOrdersResponseType> => {
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

  query.set("status", "open,expired");
  query.set("refund", "none,claimable");

  const response = await requestFreshQuery({
    api: rwaApi,
    query,
    queryKeyStart: "fetchWalletOpenOrders",
    url: `/wallets/${walletAddress}/orders`,
  });
  const parsedData = OpenOrdersSchema.parse(response.data);

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

  const { data } = await requestFreshQuery({
    api: rwaApi,
    query,
    queryKeyStart: "fetchWalletOrderHistory",
    url: `/wallets/${walletAddress}/transactions`,
  });

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

  const { data } = await requestFreshQuery({
    api: rwaApi,
    query,
    queryKeyStart: "fetchWalletTransferHistory",
    url: `/wallets/${walletAddress}/transactions`,
  });

  return TransferHistorySchema.parse(data);
};
