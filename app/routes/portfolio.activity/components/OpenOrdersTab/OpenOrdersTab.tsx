import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";

import { fetchWalletOpenOrders } from "~/lib/apis/rwa/orders/orders";
import { Spinner } from "~/lib/atoms/Spinner";
import { RPagination } from "~/lib/molecules/RPagination";
import {
  getNextSortState,
  TableHeader,
  type SortState,
} from "~/lib/molecules/RSortableTableHeader";
import { useUserContext } from "~/providers/UserProvider/user.provider";

import { OpenOrdersTableRow } from "./OpenOrdersTableRow";
import {
  headers,
  SEARCH_START_LENGTH,
  type OpenOrdersTabProps,
  type ServerSortKey,
} from "./OpenOrdersTab.types";
import styles from "./styles.module.css";
import { RText } from "~/lib/atoms/RTypography/RText";

const OPEN_ORDERS_PER_PAGE = 10;

export function OpenOrdersTab({
  searchValue = "",
  tokenAddress,
}: OpenOrdersTabProps) {
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

  const openOrdersQuery = useQuery({
    queryKey: [
      "fetchWalletOpenOrders",
      userAddress,
      searchValueDebounced,
      serverSort,
      page,
      tokenAddress,
    ],
    queryFn: () =>
      fetchWalletOpenOrders({
        page,
        perPage: OPEN_ORDERS_PER_PAGE,
        search: searchValueDebounced || undefined,
        sort: serverSort || undefined,
        tokenAddress,
        walletAddress: userAddress ?? "",
      }),
    enabled: Boolean(userAddress),
    placeholderData: (previousData) => previousData,
    // refetchInterval: 7000,
    retry: false,
  });

  useEffect(() => {
    const totalPages = openOrdersQuery.data?.total_pages ?? 0;

    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    }
  }, [openOrdersQuery.data?.total_pages, page]);

  if (openOrdersQuery.isLoading && !openOrdersQuery.data) {
    return (
      <div className={styles.state} aria-live="polite">
        <RText color="neutral-600" size="body-sm">
          Loading open orders...
        </RText>
      </div>
    );
  }

  if (openOrdersQuery.isError) {
    return (
      <div className={styles.state} aria-live="polite">
        <RText color="neutral-600" size="body-sm">
          Unable to load open orders.
        </RText>
      </div>
    );
  }

  const orders = openOrdersQuery.data?.items ?? [];

  if (!orders.length) {
    return (
      <div className={styles.state}>
        <RText color="neutral-600" size="body-sm">
          No open orders.
        </RText>
      </div>
    );
  }

  const handleSort = (key: ServerSortKey) => {
    setSort((currentSort) => getNextSortState(currentSort, key));
    setPage(1);
  };

  const { total, total_pages: totalPages = 0 } = openOrdersQuery.data ?? {};

  return (
    <div className={styles.content}>
      <div className={styles.viewport}>
        {openOrdersQuery.isFetching && (
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
                key={`${header.label}-${index}`}
                className={styles.headerCell}
                role="columnheader"
              >
                <TableHeader
                  direction={
                    sort?.key === header.sortKey ? sort?.direction : undefined
                  }
                  label={header.label}
                  onSort={
                    header.sortKey
                      ? () => handleSort(header.sortKey ?? "amount")
                      : undefined
                  }
                />
              </div>
            ))}
          </div>

          <div role="rowgroup">
            {orders.map((order) => (
              <OpenOrdersTableRow
                key={order.id}
                onAfterAction={openOrdersQuery.refetch}
                order={order}
              />
            ))}
          </div>
        </div>
      </div>
      {total && totalPages > 0 ? (
        <div className={styles.paginationFooter}>
          <RPagination
            ariaLabel="Open orders pagination"
            currentPage={page}
            isLoading={openOrdersQuery.isFetching}
            onPageChange={setPage}
            totalPages={totalPages}
          />
        </div>
      ) : null}
    </div>
  );
}
