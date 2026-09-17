import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";

import { fetchWalletOrderHistory } from "~/lib/apis/rwa/orders/orders";
import { Spinner } from "~/lib/atoms/Spinner";
import { RPagination } from "~/lib/molecules/RPagination";
import {
  getNextSortState,
  TableHeader,
  type SortState,
} from "~/lib/molecules/RSortableTableHeader";
import { RText } from "~/lib/atoms/RTypography/RText";
import { useUserContext } from "~/providers/UserProvider/user.provider";

import { TransactionHistoryTableRow } from "./TransactionHistoryTableRow";
import {
  headers,
  SEARCH_START_LENGTH,
  type ServerSortKey,
  type TransactionHistoryTabProps,
} from "./TransactionHistoryTab.types";
import styles from "./styles.module.css";

const TRANSACTION_HISTORY_PER_PAGE = 10;

export function TransactionHistoryTab({
  searchValue,
}: TransactionHistoryTabProps) {
  const { userAddress } = useUserContext();
  const [sort, setSort] = useState<SortState<ServerSortKey>>({
    direction: "descending",
    key: "date",
  });
  const [page, setPage] = useState(1);

  const normalizedSearch = useMemo(() => {
    const term = searchValue.trim().toLowerCase();

    if (term.length < SEARCH_START_LENGTH) return "";

    return term;
  }, [searchValue]);

  const [searchValueDebounced] = useDebounce(normalizedSearch, 300);

  useEffect(() => {
    setPage(1);
  }, [searchValueDebounced]);

  const serverSort = useMemo(() => {
    if (!sort) {
      return "";
    }

    const direction = sort.direction === "descending" ? "desc" : "asc";

    return `${sort.key}_${direction}`;
  }, [sort]);

  const transactionHistoryQuery = useQuery({
    queryKey: [
      "fetchWalletOrderHistory",
      userAddress,
      searchValueDebounced,
      serverSort,
      page,
    ],
    queryFn: () =>
      fetchWalletOrderHistory({
        page,
        perPage: TRANSACTION_HISTORY_PER_PAGE,
        search: searchValueDebounced || undefined,
        sort: serverSort || undefined,
        walletAddress: userAddress ?? "",
      }),
    enabled: Boolean(userAddress),
    placeholderData: (previousData) => previousData,
    retry: false,
  });

  useEffect(() => {
    const totalPages = transactionHistoryQuery.data?.total_pages ?? 0;

    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [page, transactionHistoryQuery.data?.total_pages]);

  if (transactionHistoryQuery.isLoading && !transactionHistoryQuery.data) {
    return (
      <div className={styles.state} aria-live="polite">
        <RText color="neutral-600" size="body-sm">
          Loading transaction history...
        </RText>
      </div>
    );
  }

  if (transactionHistoryQuery.isError) {
    return (
      <div className={styles.state} aria-live="polite">
        <RText color="neutral-600" size="body-sm">
          Unable to load transaction history.
        </RText>
      </div>
    );
  }

  const transactions = transactionHistoryQuery.data?.items ?? [];

  if (!transactions.length) {
    return (
      <div className={styles.state}>
        <RText color="neutral-600" size="body-sm">
          No transaction history.
        </RText>
      </div>
    );
  }

  const handleSort = (key: ServerSortKey) => {
    setSort((currentSort) => getNextSortState(currentSort, key));
    setPage(1);
  };

  const {
    total,
    total_pages: totalPages = 0,
  } = transactionHistoryQuery.data ?? {};

  return (
    <div className={styles.content}>
      <div className={styles.viewport}>
        {transactionHistoryQuery.isFetching && (
          <div
            className={styles.loadingOverlay}
            role="status"
            aria-live="polite"
          >
            <Spinner size={32} />
          </div>
        )}
        <div className={styles.table} role="table">
          <div className={styles.headerRow} role="row">
            {headers.map((header, index) => (
              <div
                className={styles.headerCell}
                key={`${header.label}-${index}`}
                role="columnheader"
              >
                <TableHeader
                  direction={
                    sort?.key === header.sortKey ? sort?.direction : undefined
                  }
                  label={header.label}
                  onSort={
                    header.sortKey
                      ? () => handleSort(header.sortKey ?? "date")
                      : undefined
                  }
                />
              </div>
            ))}
          </div>

          <div role="rowgroup">
            {transactions.map((transaction) => (
              <TransactionHistoryTableRow
                key={transaction.id}
                transaction={transaction}
              />
            ))}
          </div>
        </div>
      </div>
      {total && totalPages > 0 ? (
        <div className={styles.paginationFooter}>
          <RPagination
            ariaLabel="Transaction history pagination"
            currentPage={page}
            isLoading={transactionHistoryQuery.isFetching}
            onPageChange={setPage}
            totalPages={totalPages}
          />
        </div>
      ) : null}
    </div>
  );
}
