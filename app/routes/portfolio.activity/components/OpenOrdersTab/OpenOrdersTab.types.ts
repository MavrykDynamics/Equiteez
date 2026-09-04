export type OpenOrdersTabProps = {
  searchValue?: string;
  tokenAddress?: string;
};

export type ServerSortKey = "date" | "price" | "amount";

export type HeaderConfig = {
  label: string;
  sortKey?: ServerSortKey;
};

export const SEARCH_START_LENGTH = 3;

export const headers: HeaderConfig[] = [
  { label: "DATE", sortKey: "date" },
  { label: "ASSET" },
  { label: "TYPE" },
  { label: "PRICE", sortKey: "price" },
  { label: "AMOUNT", sortKey: "amount" },
  { label: "FILLED" },
  { label: "EXPIRES" },
  { label: "TOTAL" },
  { label: "" },
];
