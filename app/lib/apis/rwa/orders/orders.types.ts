import { z } from "zod";
import {
  OpenOrderItemSchema,
  OpenOrdersSchema,
  OrderHistoryItemSchema,
  OrderHistorySchema,
  TransferHistoryItemSchema,
  TransferHistorySchema,
} from "~/lib/apis/rwa/orders/orders.schema";

export type OpenOrderItemType = z.infer<typeof OpenOrderItemSchema>;
export type OpenOrdersResponseType = z.infer<typeof OpenOrdersSchema>;
export type OrderHistoryItemType = z.infer<typeof OrderHistoryItemSchema>;
export type OrderHistoryResponseType = z.infer<typeof OrderHistorySchema>;
export type TransferHistoryItemType = z.infer<typeof TransferHistoryItemSchema>;
export type TransferHistoryResponseType = z.infer<typeof TransferHistorySchema>;

export type WalletTransferHistoryParams = {
  walletAddress: string;
  page?: number;
  perPage?: number;
  search?: string;
  sort?: string;
  tokenAddress?: string;
};
