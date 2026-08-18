import { useMemo, useState } from "react";
import { RIcon } from "~/lib/atoms/RIcon";
import { RSortableTableHeader } from "~/lib/molecules/RSortableTableHeader";

import type { WalletPortfolioAssetType } from "~/lib/apis/rwa/wallet/wallet.types";
import { AssetsTableRow } from "./AssetsTableRow";
import styles from "./styles.module.css";
import { RText } from "~/lib/atoms/RTypography/RText";

type AllAssetsTableProps = {
  assets: WalletPortfolioAssetType[];
};

type SortDirection = "ascending" | "descending";
type SortKey = "value" | "price" | "yield_pct" | "profit";

type TableHeader = {
  label: string;
  sortKey?: SortKey;
};

const tableHeaders: TableHeader[] = [
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
  direction: SortDirection
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
  const [sort, setSort] = useState<{
    direction: SortDirection;
    key: SortKey;
  } | null>(null);
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
    setSort((currentSort) => ({
      direction:
        currentSort?.key === key && currentSort.direction === "descending"
          ? "ascending"
          : "descending",
      key,
    }));
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
              {tableHeaders.map((header) =>
                header.sortKey ? (
                  <RSortableTableHeader
                    direction={
                      sort?.key === header.sortKey ? sort.direction : undefined
                    }
                    key={header.label}
                    label={header.label}
                    onSort={() => handleSort(header.sortKey!)}
                  />
                ) : (
                  <th key={header.label} scope="col">
                    <span className={styles.headerContent}>{header.label}</span>
                  </th>
                )
              )}
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
