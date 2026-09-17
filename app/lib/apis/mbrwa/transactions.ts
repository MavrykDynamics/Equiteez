import { mbrwaApiUrl } from "~/lib/apis/mbrwa/index";
import { api } from "~/lib/utils/api";
import { TransactionsListType } from "./user/userTransactions/transactions.types";
import { TransactionsListSchema } from "./user/userTransactions/transactions.schema";

export const fetchUserTransactions = async (
  userAddress: string,
  offset: number,
  limit: number,
  searchTerm: string | null
): Promise<TransactionsListType> => {
  const params = new URLSearchParams({
    offset: offset.toString(),
    limit: limit.toString(),
    ...(searchTerm ? { searchTerm } : {}),
  });

  const url = `${mbrwaApiUrl}wallet/${userAddress}/transactions?${params.toString()}`;

  const { data } = await api(url, { method: "GET" }, TransactionsListSchema);

  return data;
};
