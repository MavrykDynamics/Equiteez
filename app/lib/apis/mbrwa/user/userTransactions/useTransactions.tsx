import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type {
  TransactionType,
  InitialTransactionType,
} from "~/lib/apis/mbrwa/user/userTransactions/transactions.types";
import { fetchUserTransactions } from "~/lib/apis/mbrwa/transactions";
import { useTokensContext } from "~/providers/TokensProvider/tokens.provider";
import { toTokenSlug } from "~/lib/assets";
import { getAssetLinkByAddress } from "~/routes/wallet.assets/components/AssetItem/AssetActions";
import {
  OrderIconByType,
  OrderNameByType,
  OrderSymbolByType,
  OrderTypes,
} from "~/lib/apis/mbrwa/user/userOrders/order.const";
import { useMarketsContext } from "~/providers/MarketsProvider/markets.provider";
import {
  TransactionTypes,
  TransferIconByType,
  TransferNameByType,
  TransferSymbolByType,
  TransferType,
} from "~/lib/apis/mbrwa/user/userTransactions/transactions.const";
import { unknownToError } from "~/errors/error";
import { useToasterContext } from "~/providers/ToasterProvider/toaster.provider";

const getTransactionMetadata = (transaction: InitialTransactionType) => {
  if (transaction.type === TransactionTypes.ORDER) {
    return {
      transactionSymbol: OrderSymbolByType[transaction.order_type],
      transactionName: OrderNameByType[transaction.order_type],
      transactionIcon: OrderIconByType[transaction.order_type],
    };
  }

  return {
    transactionSymbol: TransferSymbolByType[transaction.transfer_type],
    transactionName: TransferNameByType[transaction.transfer_type],
    transactionIcon: TransferIconByType[transaction.transfer_type],
  };
};

const getIsSellTransaction = (transaction: InitialTransactionType) => {
  if (transaction.type === TransactionTypes.ORDER)
    return (
      transaction.order_type === OrderTypes.MARKET_SELL ||
      transaction.order_type === OrderTypes.LIMIT_SELL
    );

  return transaction.transfer_type === TransferType.WITHDRAW;
};

export function useTransactions(
  offset: number,
  limit: number,
  userAddress: string | null,
  searchTerm: string,
  orderType: string | null
) {
  const { tokensMetadata } = useTokensContext();
  const { marketsArr } = useMarketsContext();
  const { warning } = useToasterContext();

  const [transactions, setTransactions] = useState<TransactionType[]>([]);
  const [transactionsCount, setTransactionsCount] = useState(0);

  const transactionsData = useQuery({
    queryKey: [
      "fetchUserTransactions",
      userAddress,
      offset,
      limit,
      orderType,
      searchTerm,
    ],
    retry: false,
    queryFn: () =>
      fetchUserTransactions(userAddress || "", offset, limit, searchTerm),
  });

  useEffect(() => {
    if (!transactionsData.data) return;
    const transactions = transactionsData.data.items;
    const totalCount = transactionsData.data.total_count;

    setTransactionsCount(totalCount);
    setTransactions(
      transactions.map((transaction) => {
        const tokenSlug = toTokenSlug(transaction.token.address, 0);
        const tokenMetadata = tokensMetadata[tokenSlug];
        const assetLink = getAssetLinkByAddress(
          marketsArr,
          transaction.token.address
        );

        const { transactionSymbol, transactionName, transactionIcon } =
          getTransactionMetadata(transaction);
        const isSell = getIsSellTransaction(transaction);

        return {
          ...transaction,
          tokenSlug,
          tokenMetadata,
          assetLink,
          transactionSymbol,
          transactionName,
          transactionIcon,
          isSell,
        };
      })
    );
  }, [transactionsData.data]);

  useEffect(() => {
    if (transactionsData.error) {
      const err = unknownToError(transactionsData.error);
      warning("Error on get user transaction data", err.message);
    }
  }, [transactionsData.error]);

  return {
    transactions,
    loading:
      transactionsData.isLoading ||
      transactionsData.isFetching ||
      transactionsData.isPending,
    transactionsCount,
  };
}
