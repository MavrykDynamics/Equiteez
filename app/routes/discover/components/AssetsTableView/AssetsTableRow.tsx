import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import { RText } from "~/lib/atoms/RTypography/RText";
import { Link } from "@remix-run/react";

import styles from "./styles.module.css";
import Money from "~/lib/atoms/Money";
import { RIcon } from "~/lib/atoms/RIcon";

type AssetsTableRowProps = {
  asset: AssetType;
};

export function AssetsTableRow({ asset }: AssetsTableRowProps) {
  return (
    <Link className={styles.row} role="row" to="/">
      <div className={styles.cell} role="cell">
        <div className={styles.assetContent}>
          <RText className={styles.assetSymbol} size="body-sm" weight="medium">
            {asset.metadata.symbol || "--"}
          </RText>
          <RText
            className={styles.assetName}
            color="neutral-600"
            size="body-sm"
          >
            {asset.metadata.name || "--"}
          </RText>
        </div>
      </div>
      <div className={styles.cell} role="cell">
        <RText size="body-sm">{asset.profile.asset_type || "--"}</RText>
      </div>
      <div className={styles.cell} role="cell">
        <RText size="body-sm">
          $<Money>{asset.stats?.price.usd ?? 0}</Money>
        </RText>
      </div>
      <div className={styles.cell} role="cell">
        <RText color="neutral-600" size="body-sm">
          --
        </RText>
      </div>
      <div className={styles.cell} role="cell">
        <RText size="body-sm">
          <Money>{asset.apy}</Money>%
        </RText>
      </div>
      <div className={styles.cell} role="cell">
        <RText size="body-sm">
          $<Money>{asset.stats?.market_cap.usd ?? 0}</Money>
        </RText>
      </div>
      <div
        aria-label="24 hour chart placeholder"
        className={`${styles.cell} ${styles.chartCell}`}
        role="cell"
      />
      <div className={`${styles.cell} ${styles.actionCell}`} role="cell">
        <RText color="neutral-400" size="body-sm">
          <RIcon name="arrow-long-up-right" />
        </RText>
      </div>
    </Link>
  );
}
