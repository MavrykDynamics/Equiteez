import { z } from "zod";
import {
  OpenOrderItemSchema,
  OpenOrdersSchema,
  OrderHistoryItemSchema,
  OrderHistorySchema,
} from "~/lib/apis/rwa/orders/orders.schema";

export type OpenOrderItemType = z.infer<typeof OpenOrderItemSchema>;
export type OpenOrdersResponseType = z.infer<typeof OpenOrdersSchema>;
export type OrderHistoryItemType = z.infer<typeof OrderHistoryItemSchema>;
export type OrderHistoryResponseType = z.infer<typeof OrderHistorySchema>;
