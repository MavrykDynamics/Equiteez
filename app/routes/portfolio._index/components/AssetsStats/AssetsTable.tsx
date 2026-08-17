import { useMemo, useState } from "react";
import { RIcon } from "~/lib/atoms/RIcon";

import type { WalletPortfolioAssetType } from "~/lib/apis/rwa/wallet/wallet.types";
import { AssetsTableRow } from "./AssetsTableRow";
import styles from "./styles.module.css";
import { RText } from "~/lib/atoms/RTypography/RText";

type AllAssetsTableProps = {
  assets: WalletPortfolioAssetType[];
};

const tableHeaders = [
  "Asset",
  "Amount",
  "Avg Price",
  "Price / 1M",
  "Yield",
  "Profit",
];

export function AssetsTable({ assets }: AllAssetsTableProps) {
  const [search, setSearch] = useState("");
  const filteredAssets = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return assets.filter((asset) => {
      return (
        !normalizedSearch ||
        asset.name.toLowerCase().includes(normalizedSearch) ||
        asset.symbol.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [assets, search]);

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
                <th key={header} scope="col">
                  <span className={styles.headerContent}>
                    {header}
                    {header !== "Asset" && (
                      <RIcon name="arrow-short-up" size="small" />
                    )}
                  </span>
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
