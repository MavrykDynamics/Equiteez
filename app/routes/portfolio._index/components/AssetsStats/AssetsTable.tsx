import { useMemo, useState } from "react";
import { RIcon } from "~/lib/atoms/RIcon";
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
import { Spinner } from "~/lib/atoms/Spinner";
import { usePortfolioContext } from "~/providers/PortfolioProvider/portfolio.provider";

export function AssetsTable({ assets }: AllAssetsTableProps) {
  const { isLoading, wallet } = usePortfolioContext();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortState<SortKey>>(null);

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

  const handleSort = (key: SortKey) => {
    setSort((currentSort) => getNextSortState(currentSort, key));
  };

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
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search Asset"
            type="search"
            value={search}
          />
        </label>
      </div>
      <div className={styles.tableViewport}>
        {isLoading ? (
          <div
            className={styles.sectionLoader}
            role="status"
            aria-live="polite"
          >
            <Spinner size={32} />
          </div>
        ) : null}
        <table className={styles.table}>
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
          <tbody>
            {filteredAssets.map((asset) => (
              <AssetsTableRow
                asset={asset}
                canRefund={rwaAddresses.has(asset.token_address)}
                key={asset.token_address}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
