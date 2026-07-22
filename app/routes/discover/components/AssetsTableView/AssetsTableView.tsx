import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import { RText } from "~/lib/atoms/RTypography/RText";

import { AssetsTableRow } from "./AssetsTableRow";
import styles from "./styles.module.css";

type AssetsTableViewProps = {
  assets: AssetType[];
};

const columns = [
  "ASSET",
  "TYPE",
  "PRICE",
  "24H",
  "NET YIELD",
  "MARKET CAP",
  "24H CHART / BAR",
  "",
];

export function AssetsTableView({ assets }: AssetsTableViewProps) {
  return (
    <div className={styles.viewport}>
      <div className={styles.tableFrame}>
        <div className={styles.table} role="table">
          <div className={styles.headerRow} role="row">
            {columns.map((column, index) => (
              <div
                className={styles.headerCell}
                key={`${column}-${index}`}
                role="columnheader"
              >
                {column ? (
                  <RText color="neutral-600" size="body-xs">
                    {column}
                  </RText>
                ) : null}
              </div>
            ))}
          </div>
          <div role="rowgroup">
            {assets.map((asset) => (
              <AssetsTableRow asset={asset} key={asset.address} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
