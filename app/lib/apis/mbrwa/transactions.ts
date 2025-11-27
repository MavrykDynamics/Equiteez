import { mbrwaApiUrl } from "~/lib/apis/mbrwa/index";
import { api } from "~/lib/utils/api";
import { TransactionsListSchema } from "~/lib/userTransactions/transactions.schema";
import { TransactionsListType } from "~/lib/userTransactions/transactions.types";

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
