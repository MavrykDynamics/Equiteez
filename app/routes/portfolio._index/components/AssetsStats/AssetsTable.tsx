import { useMemo, useState } from "react";
import { RIcon } from "~/lib/atoms/RIcon";
import { RPagination } from "~/lib/molecules/RPagination";
import {
  getNextSortState,
  TableHeader,
  type SortState,
} from "~/lib/molecules/RSortableTableHeader";

import { AssetsTableRow } from "./AssetsTableRow";
import {
  compareNullableNumbers,
  tableHeaders,
  type AllAssetsTableProps,
  type SortKey,
} from "./AssetsTable.types";
import styles from "./styles.module.css";
import { RText } from "~/lib/atoms/RTypography/RText";
import { AssetsTableSkeletonRows } from "./AssetsStatsSkeleton";
import { usePortfolioContext } from "~/providers/PortfolioProvider/portfolio.provider";
import { RSkeletonReveal } from "~/lib/atoms/RSkeleton";

const ASSETS_PER_PAGE = 10;

export function AssetsTable({ assets }: AllAssetsTableProps) {
  const { isPortfolioLoading, wallet } = usePortfolioContext();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortState<SortKey>>(null);
  // One-based; a new search or sort starts again from the first page.
  const [page, setPage] = useState(1);

  // rwa_assets is keyed by symbol, so match portfolio rows by contract address.
  const rwaAddresses = useMemo(
    () =>
      new Set(
        Object.values(wallet?.rwa_assets ?? {}).map(({ address }) => address)
      ),
    [wallet?.rwa_assets]
  );

  const filteredAssets = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const matchingAssets = assets.filter(
      (asset) =>
        !normalizedSearch ||
        asset.name.toLowerCase().includes(normalizedSearch) ||
        asset.symbol.toLowerCase().includes(normalizedSearch)
    );

    if (!sort) {
      return matchingAssets;
    }

    return [...matchingAssets].sort((firstAsset, secondAsset) =>
      compareNullableNumbers(
        firstAsset[sort.key],
        secondAsset[sort.key],
        sort.direction
      )
    );
  }, [assets, search, sort]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAssets.length / ASSETS_PER_PAGE)
  );
  // Stay on a page that still exists when the asset list shrinks.
  const currentPage = Math.min(page, totalPages);
  const pageAssets = filteredAssets.slice(
    (currentPage - 1) * ASSETS_PER_PAGE,
    currentPage * ASSETS_PER_PAGE
  );

  const handleSort = (key: SortKey) => {
    setSort((currentSort) => getNextSortState(currentSort, key));
    setPage(1);
  };

  const tableHead = (
    <thead>
      <tr>
        {tableHeaders.map((header) => (
          <th key={header.label || "actions"} scope="col">
            <TableHeader
              direction={
                sort?.key === header.sortKey ? sort?.direction : undefined
              }
              label={header.label}
              onSort={
                header.sortKey
                  ? () => handleSort(header.sortKey ?? "value")
                  : undefined
              }
            />
          </th>
        ))}
      </tr>
    </thead>
  );

  return (
    <div className={styles.tableSection}>
      <div className={styles.tableToolbar}>
        <RText size="body-m" weight="medium">
          Portfolio
        </RText>
        <label className={styles.search}>
          <RIcon name="search" size="small" />
          <input
            aria-label="Search asset"
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search Asset"
            type="search"
            value={search}
          />
        </label>
      </div>
      {/* The skeleton is the same table with placeholder rows, so the header
          stays put while the rows crossfade in */}
      <RSkeletonReveal
        isLoading={isPortfolioLoading}
        skeleton={
          <div className={styles.tableViewport}>
            <table className={styles.table}>
              {tableHead}
              <tbody aria-busy="true">
                <AssetsTableSkeletonRows />
              </tbody>
            </table>
          </div>
        }
      >
        <div className={styles.tableViewport}>
          <table className={styles.table}>
            {tableHead}
            <tbody>
              {pageAssets.map((asset) => (
                <AssetsTableRow
                  asset={asset}
                  canRefund={rwaAddresses.has(asset.token_address)}
                  key={asset.token_address}
                />
              ))}
            </tbody>
          </table>
        </div>
        <RPagination
          ariaLabel="Portfolio assets pagination"
          className={styles.pagination}
          currentPage={currentPage}
          onPageChange={setPage}
          totalPages={totalPages}
        />
      </RSkeletonReveal>
    </div>
  );
}
