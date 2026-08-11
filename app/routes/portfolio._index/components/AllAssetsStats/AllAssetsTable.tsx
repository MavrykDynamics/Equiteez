import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RIcon } from "~/lib/atoms/RIcon";

import type { PortfolioAsset } from "~/routes/portfolio._index/components/AllAssetsStats/types";
import { AllAssetsTableRow } from "./AllAssetsTableRow";
import styles from "./styles.module.css";
import { RText } from "~/lib/atoms/RTypography/RText";

type AllAssetsTableProps = {
  assets: PortfolioAsset[];
  onSearchChange: (value: string) => void;
  search: string;
};

const tableHeaders = [
  "Asset",
  "Amount",
  "Avg Price",
  "Price / 1M",
  "Yield",
  "Profit",
];

export function AllAssetsTable({
  assets,
  onSearchChange,
  search,
}: AllAssetsTableProps) {
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
            onChange={(event) => onSearchChange(event.target.value)}
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
            {assets.map((asset) => (
              <AllAssetsTableRow asset={asset} key={asset.id} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
