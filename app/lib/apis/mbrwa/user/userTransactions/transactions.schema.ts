import { z } from "zod";
import {
  OrderStatus,
  OrderTypes,
} from "~/lib/apis/mbrwa/user/userOrders/order.const";
import {
  TransactionTypes,
  TransferType,
} from "~/lib/apis/mbrwa/user/userTransactions/transactions.const";

export const TransactionOrderSchema = z.object({
  id: z.string().optional(),
  type: z.literal(TransactionTypes.ORDER),
  date: z.string(),
  order_type: z.nativeEnum(OrderTypes),
  order_status: z.nativeEnum(OrderStatus),
  token: z.object({
    address: z.string(),
    name: z.string(),
    symbol: z.string(),
  }),
  rwa_token_amount: z.number(),
  price_per_rwa_token: z.number(),
  fulfilled_amount: z.number(),
  unfulfilled_amount: z.number(),
  operation_hash: z.string().optional().nullable(),
  total_usd_value_of_rwa_token_amount: z.number(),
});

export const TransactionTransferSchema = z.object({
  id: z.string().optional(),
  type: z.literal(TransactionTypes.TRANSFER),
  date: z.string(),
  operation_hash: z.string().optional().nullable(),
  transfer_type: z.nativeEnum(TransferType),
  token: z.object({
    address: z.string(),
    symbol: z.string(),
  }),
  amount: z.number(),
  usd_amount: z.number(),
  from_user_address: z.string(),
  to_user_address: z.string(),
});

export const TransactionsListSchema = z.object({
  items: z.array(z.union([TransactionOrderSchema, TransactionTransferSchema])),
  total_count: z.number(),
});
