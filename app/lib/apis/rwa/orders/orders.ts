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
  tokenAddress: string;
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
  const { data } = await rwaApi.get(
    `/wallets/${walletAddress}/transactions?token_address=${tokenAddress}&types=limit_sell&types=limit_buy&types=market_buy&types=market_sell`
  );

  return OrderHistorySchema.parse(data);
};
