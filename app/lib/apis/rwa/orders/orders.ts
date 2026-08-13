import { rwaApi } from "~/lib/apis/rwa/client";
import {
  OpenOrdersSchema,
  OrderHistorySchema,
} from "~/lib/apis/rwa/orders/orders.schema";
import {
  OpenOrdersResponseType,
  OrderHistoryResponseType,
} from "~/lib/apis/rwa/orders/orders.types";

type WalletOpenOrdersParams = {
  walletAddress: string;
  tokenAddress?: string;
};

type WalletOrdersParams = {
  walletAddress: string;
  tokenAddress?: string;
};

export const fetchWalletOpenOrders = async ({
  walletAddress,
  tokenAddress,
}: WalletOpenOrdersParams): Promise<OpenOrdersResponseType> => {
  const query = new URLSearchParams();

  if (tokenAddress) {
    query.set("token_address", tokenAddress);
  }

  const queryString = query.toString();
  const url = `/wallets/${walletAddress}/orders${
    queryString ? `?${queryString}` : ""
  }`;

  const { data } = await rwaApi.get(url);

  return OpenOrdersSchema.parse(data);
};

export const fetchWalletOrderHistory = async ({
  walletAddress,
  tokenAddress,
}: WalletOrdersParams): Promise<OrderHistoryResponseType> => {
  const query = new URLSearchParams();

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
