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

export function AssetsTable({ assets }: AllAssetsTableProps) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortState<SortKey>>(null);

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
        <table className={styles.table}>
          <thead>
            <tr>
              {tableHeaders.map((header) => (
                <th key={header.label} scope="col">
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
              <AssetsTableRow asset={asset} key={asset.token_address} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
