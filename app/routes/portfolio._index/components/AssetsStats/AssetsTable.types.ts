import type { SortState } from "~/lib/molecules/RSortableTableHeader";
import type { WalletPortfolioAssetType } from "~/lib/apis/rwa/wallet/wallet.types";

export type AllAssetsTableProps = {
  assets: WalletPortfolioAssetType[];
};

export type SortKey = "value" | "price" | "yield_pct" | "profit";

export type HeaderConfig = {
  label: string;
  sortKey?: SortKey;
};

export const tableHeaders: HeaderConfig[] = [
  { label: "Asset" },
  { label: "Amount", sortKey: "value" },
  { label: "Avg Price" },
  { label: "Price / 1M", sortKey: "price" },
  { label: "Yield", sortKey: "yield_pct" },
  { label: "Profit", sortKey: "profit" },
];

export function compareNullableNumbers(
  firstValue: number | null,
  secondValue: number | null,
  direction: NonNullable<SortState<SortKey>>["direction"]
) {
  if (firstValue === null) {
    return secondValue === null ? 0 : 1;
  }

  if (secondValue === null) {
    return -1;
  }

  const difference = firstValue - secondValue;

  return direction === "ascending" ? difference : -difference;
}
