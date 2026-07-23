import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import Money from "~/lib/atoms/Money";
import { RText } from "~/lib/atoms/RTypography/RText";

import styles from "./styles.module.css";

type AssetSaleProgressProps = {
  asset: AssetType;
};

function getNumericValue(value: string) {
  const numericValue = Number(value);

  return Number.isFinite(numericValue) ? numericValue : 0;
}

export function AssetSaleProgress({ asset }: AssetSaleProgressProps) {
  const totalTokens = getNumericValue(
    asset.finance.max_supply || asset.total_supply
  );
  const soldTokens = asset.contracts.reduce(
    (total, contract) => total + getNumericValue(contract.tokens_sold),
    0
  );
  const tokensLeft = Math.max(totalTokens - soldTokens, 0);
  const soldPercentage = totalTokens
    ? Math.min((soldTokens / totalTokens) * 100, 100)
    : 0;
  const isSoldOut = totalTokens > 0 && tokensLeft === 0;

  return (
    <div className={styles.saleProgress}>
      <div className={styles.saleProgressHeader}>
        <RText color="neutral-600" size="body-s">
          Tokens Left
        </RText>
        <RText size="body-s" weight="medium">
          <Money fiat tooltip={false}>
            {tokensLeft}
          </Money>
        </RText>
      </div>
      <div
        aria-label={`${soldPercentage.toFixed(0)}% sold`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={soldPercentage}
        className={styles.progressTrack}
        role="progressbar"
      >
        <span
          className={styles.progressValue}
          data-sold-out={isSoldOut || undefined}
          style={{ width: `${soldPercentage}%` }}
        />
      </div>
      <div className={styles.saleProgressFooter}>
        <RText color="neutral-600" size="body-s">
          <Money tooltip={false}>{soldPercentage}</Money>% sold
        </RText>
        <RText color="neutral-600" size="body-s">
          <Money tooltip={false}>{totalTokens}</Money> total
        </RText>
      </div>
    </div>
  );
}
