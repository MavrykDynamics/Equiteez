import { z } from "zod";
import { fetchWalletTransferHistoryResponse } from "~/lib/apis/rwa/orders/orders";
import {
  TransferHistorySchema,
  TransferHistoryItemSchema,
} from "~/lib/apis/rwa/orders/orders.schema";
import type { WalletTransferHistoryParams } from "~/lib/apis/rwa/orders/orders.types";

export const PRIMARY_HISTORY_QUERY_KEY = "primary-purchase-history";

const receiptHistorySchema = TransferHistorySchema.extend({
  items: z.array(
    TransferHistoryItemSchema.extend({ operation_hash: z.string().nullable() })
  ),
});

/** The RWA API currently exposes receipts only, not verified purchase records. */
export async function fetchPrimaryPurchaseHistory(
  params: Omit<WalletTransferHistoryParams, "types">
) {
  const data = await fetchWalletTransferHistoryResponse({
    ...params,
    types: ["deposit"],
  });
  return receiptHistorySchema.parse(data);
}
