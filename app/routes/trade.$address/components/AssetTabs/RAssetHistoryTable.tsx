import type { ReactNode } from "react";
import { Spinner } from "~/lib/atoms/Spinner";
import { RPagination } from "~/lib/molecules/RPagination";
import {
  TableHeader,
  type SortState,
} from "~/lib/molecules/RSortableTableHeader";
import styles from "./OrderHistoryTab/styles.module.css";

export type HistorySortKey = "amount" | "date" | "total";

type HeaderConfig = {
  label: string;
  sortKey?: HistorySortKey;
};

const headers: HeaderConfig[] = [
  { label: "DATE", sortKey: "date" },
  { label: "ASSET" },
  { label: "TYPE" },
  { label: "PRICE" },
  { label: "AMOUNT", sortKey: "amount" },
  { label: "STATUS" },
  { label: "TOTAL", sortKey: "total" },
];

export function RAssetHistoryTable({
  children,
  sort,
  onSort,
  isFetching,
  page,
  onPageChange,
  totalPages,
  paginationLabel,
}: {
  children: ReactNode;
  sort: SortState<HistorySortKey>;
  onSort: (key: HistorySortKey) => void;
  isFetching: boolean;
  page: number;
  onPageChange: (page: number) => void;
  totalPages: number;
  paginationLabel: string;
}) {
  return (
    <div className={styles.content}>
      <div className={styles.viewport}>
        {isFetching ? (
          <div
            className={styles.loadingOverlay}
            role="status"
            aria-live="polite"
          >
            <Spinner size={32} />
          </div>
        ) : null}
        <div className={styles.table} role="table">
          <div className={styles.headerRow} role="row">
            {headers.map((header) => (
              <div
                className={styles.headerCell}
                key={header.label}
                role="columnheader"
              >
                <TableHeader
                  direction={
                    sort?.key === header.sortKey ? sort?.direction : undefined
                  }
                  label={header.label}
                  onSort={
                    header.sortKey
                      ? () => onSort(header.sortKey as HistorySortKey)
                      : undefined
                  }
                />
              </div>
            ))}
          </div>
          <div role="rowgroup">{children}</div>
        </div>
      </div>
      {totalPages > 0 ? (
        <div className={styles.paginationFooter}>
          <RPagination
            ariaLabel={paginationLabel}
            currentPage={page}
            isLoading={isFetching}
            onPageChange={onPageChange}
            totalPages={totalPages}
          />
        </div>
      ) : null}
    </div>
  );
}
