import { rwaApi } from "~/lib/apis/rwa/client";
import {
  OpenOrdersSchema,
  OrderHistorySchema,
} from "~/lib/apis/rwa/orders/orders.schema";
import {
  OpenOrdersResponseType,
  OrderHistoryResponseType,
} from "~/lib/apis/rwa/orders/orders.types";

type WalletOrdersParams = {
  walletAddress: string;
  tokenAddress: string;
};

export const fetchWalletOpenOrders = async ({
  walletAddress,
  tokenAddress,
}: WalletOrdersParams): Promise<OpenOrdersResponseType> => {
  const query = new URLSearchParams({
    token_address: tokenAddress,
  });

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
  const query = new URLSearchParams({
    token_address: tokenAddress,
  });

  const { data } = await rwaApi.get(
    `/wallets/${walletAddress}/orders?${query.toString()}`
  );

  return OrderHistorySchema.parse(data);
};
