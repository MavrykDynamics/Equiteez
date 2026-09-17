export type TransactionHistoryTabProps = {
  searchValue: string;
};

export type ServerSortKey = "date" | "amount" | "total";

export type HeaderConfig = {
  label: string;
  sortKey?: ServerSortKey;
};

export const SEARCH_START_LENGTH = 3;

export const headers: HeaderConfig[] = [
  { label: "DATE", sortKey: "date" },
  { label: "ASSET" },
  { label: "TYPE" },
  { label: "AMOUNT", sortKey: "amount" },
  { label: "INTERACTION" },
  { label: "TX HASH" },
  { label: "STATUS" },
];
