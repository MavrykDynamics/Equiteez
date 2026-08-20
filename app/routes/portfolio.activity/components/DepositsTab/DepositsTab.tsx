import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";

import { fetchWalletTransferHistory } from "~/lib/apis/rwa";
import { Spinner } from "~/lib/atoms/Spinner";
import { RPagination } from "~/lib/molecules/RPagination";
import {
  getNextSortState,
  TableHeader,
  type SortState,
} from "~/lib/molecules/RSortableTableHeader";
import { RText } from "~/lib/atoms/RTypography/RText";
import { useUserContext } from "~/providers/UserProvider/user.provider";

import { DepositsTableRow } from "./DepositsTableRow";
import {
  headers,
  SEARCH_START_LENGTH,
  type DepositsTabProps,
  type ServerSortKey,
} from "./DepositsTab.types";
import styles from "./styles.module.css";

const DEPOSITS_PER_PAGE = 10;

export function DepositsTab({ searchValue }: DepositsTabProps) {
  const { userAddress } = useUserContext();
  const [sort, setSort] = useState<SortState<ServerSortKey>>({
    direction: "descending",
    key: "date",
  });
  const [page, setPage] = useState(1);

  const normalizedSearch = useMemo(() => {
    const term = searchValue.trim().toLowerCase();

    return term.length < SEARCH_START_LENGTH ? "" : term;
  }, [searchValue]);
  const [searchValueDebounced] = useDebounce(normalizedSearch, 300);

  useEffect(() => {
    setPage(1);
  }, [searchValueDebounced]);

  const serverSort = useMemo(() => {
    if (!sort) return "";

    return `${sort.key}_${sort.direction === "descending" ? "desc" : "asc"}`;
  }, [sort]);

  const depositsQuery = useQuery({
    queryKey: [
      "fetchWalletTransferHistory",
      userAddress,
      searchValueDebounced,
      serverSort,
      page,
    ],
    queryFn: () =>
      fetchWalletTransferHistory({
        page,
        perPage: DEPOSITS_PER_PAGE,
        search: searchValueDebounced || undefined,
        sort: serverSort || undefined,
        walletAddress: userAddress ?? "",
      }),
    enabled: Boolean(userAddress),
    placeholderData: (previousData) => previousData,
    retry: false,
  });

  if (depositsQuery.isLoading && !depositsQuery.data) {
    return (
      <div className={styles.state} aria-live="polite">
        <RText color="neutral-600" size="body-sm">
          Loading deposits...
        </RText>
      </div>
    );
  }

  if (depositsQuery.isError) {
    return (
      <div className={styles.state} aria-live="polite">
        <RText color="neutral-600" size="body-sm">
          Unable to load deposits.
        </RText>
      </div>
    );
  }

  const deposits = depositsQuery.data?.items ?? [];

  if (!deposits.length) {
    return (
      <div className={styles.state}>
        <RText color="neutral-600" size="body-sm">
          No deposits yet.
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
  } = depositsQuery.data ?? {};

  return (
    <div className={styles.content}>
      <div className={styles.viewport}>
        {depositsQuery.isFetching ? (
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
                      ? () => handleSort(header.sortKey ?? "date")
                      : undefined
                  }
                />
              </div>
            ))}
          </div>
          <div role="rowgroup">
            {deposits.map((deposit) => (
              <DepositsTableRow deposit={deposit} key={deposit.id} />
            ))}
          </div>
        </div>
      </div>
      {total && totalPages > 0 ? (
        <div className={styles.paginationFooter}>
          <RPagination
            ariaLabel="Deposits pagination"
            currentPage={page}
            isLoading={depositsQuery.isFetching}
            onPageChange={setPage}
            totalPages={totalPages}
          />
        </div>
      ) : null}
    </div>
  );
}
