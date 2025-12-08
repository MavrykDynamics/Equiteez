import { z } from "zod";
import {
  TransactionOrderSchema,
  TransactionsListSchema,
  TransactionTransferSchema,
} from "~/lib/apis/mbrwa/user/userTransactions/transactions.schema";
import { TokenMetadata } from "~/lib/metadata";
import { JSX } from "react";

export type TransactionOrderType = z.infer<typeof TransactionOrderSchema>;
export type TransactionTransferType = z.infer<typeof TransactionTransferSchema>;
export type TransactionsListType = z.infer<typeof TransactionsListSchema>;
export type InitialTransactionType =
  | TransactionOrderType
  | TransactionTransferType;
export type TransactionType = {
  tokenMetadata: TokenMetadata;
  tokenSlug: string;
  assetLink: string;
  transactionSymbol: string;
  isSell: boolean;
  transactionName: string;
  transactionIcon: JSX.Element;
} & InitialTransactionType;
