import { z } from "zod";
import {
  OpenOrderItemSchema,
  OpenOrdersSchema,
  OrderHistoryItemSchema,
  OrderHistorySchema,
  GasCreditTopUpItemSchema,
  TransactionHistorySchema,
  TransferHistoryItemSchema,
  TransferHistorySchema,
} from "~/lib/apis/rwa/orders/orders.schema";

export type OpenOrderItemType = z.infer<typeof OpenOrderItemSchema>;
export type OpenOrdersResponseType = z.infer<typeof OpenOrdersSchema>;
export type OrderHistoryItemType = z.infer<typeof OrderHistoryItemSchema>;
export type OrderHistoryResponseType = z.infer<typeof OrderHistorySchema>;
export type GasCreditTopUpItemType = z.infer<typeof GasCreditTopUpItemSchema>;
export type TransactionHistoryItemType = z.infer<
  typeof TransactionHistorySchema
>["items"][number];
export type TransactionHistoryResponseType = z.infer<
  typeof TransactionHistorySchema
>;
export type TransferHistoryItemType = z.infer<typeof TransferHistoryItemSchema>;
export type TransferHistoryResponseType = z.infer<typeof TransferHistorySchema>;

export type WalletTransferHistoryParams = {
  types?: ("deposit" | "withdrawal")[];
  walletAddress: string;
  page?: number;
  perPage?: number;
  search?: string;
  sort?: string;
  tokenAddress?: string;
};
