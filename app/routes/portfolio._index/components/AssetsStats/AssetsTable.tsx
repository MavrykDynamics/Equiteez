import { useMemo, useState } from "react";
import { RIcon } from "~/lib/atoms/RIcon";
import {
  getNextSortState,
  TableHeader,
  type SortState,
} from "~/lib/molecules/RSortableTableHeader";

import type { WalletPortfolioAssetType } from "~/lib/apis/rwa/wallet/wallet.types";
import { AssetsTableRow } from "./AssetsTableRow";
import styles from "./styles.module.css";
import { RText } from "~/lib/atoms/RTypography/RText";

type AllAssetsTableProps = {
  assets: WalletPortfolioAssetType[];
};

type SortKey = "value" | "price" | "yield_pct" | "profit";

type HeaderConfig = {
  label: string;
  sortKey?: SortKey;
};

const tableHeaders: HeaderConfig[] = [
  { label: "Asset" },
  { label: "Amount", sortKey: "value" },
  { label: "Avg Price" },
  { label: "Price / 1M", sortKey: "price" },
  { label: "Yield", sortKey: "yield_pct" },
  { label: "Profit", sortKey: "profit" },
];

function compareNullableNumbers(
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
