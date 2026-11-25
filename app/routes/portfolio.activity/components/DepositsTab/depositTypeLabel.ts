import type { TransferHistoryItemType } from "~/lib/apis/rwa/orders/orders.types";

// Shared by the row and its details modal; a separate module avoids the
// row ↔ modal import cycle that breaks Vite SSR.
export function getTypeLabel(row: TransferHistoryItemType): string {
  if (row.type === "deposit" && row.chain_from && row.chain_from !== "mavryk")
    return "Bridge In";
  if (row.type === "withdrawal" && row.chain_to && row.chain_to !== "mavryk")
    return "Bridge Out";
  return row.type === "deposit" ? "Deposit" : "Withdraw";
}
