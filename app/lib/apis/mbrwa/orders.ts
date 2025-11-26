import { api } from "~/lib/utils/api";
import { mbrwaApiUrl } from "~/lib/apis/mbrwa/index";
import { OrdersListSchema } from "~/lib/userOrders/orders.schema";
import type { OrdersListType } from "~/lib/userOrders/orders.types";

export const fetchUserOpenOrders = async (
  userAddress: string,
  offset: number,
  limit: number,
  orderType: string | null | undefined,
  searchTerm: string | null
): Promise<OrdersListType> => {
  const params = new URLSearchParams({
    offset: offset.toString(),
    limit: limit.toString(),
    ...(searchTerm ? { searchTerm } : {}),
    ...(orderType !== undefined && orderType !== null ? { orderType } : {}),
  });

  const url = `${mbrwaApiUrl}wallet/${userAddress}/open-orders?${params.toString()}`;

  const { data } = await api(url, { method: "GET" }, OrdersListSchema);

  return data;
};
