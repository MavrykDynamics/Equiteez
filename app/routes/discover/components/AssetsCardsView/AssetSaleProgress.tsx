import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import Money from "~/lib/atoms/Money";
import { RText } from "~/lib/atoms/RTypography/RText";
import { useAssetsContext } from "~/providers/AssetsProvider/assets.provider";

import styles from "./styles.module.css";
import { atomsToTokens } from "~/lib/utils/formaters";

type AssetSaleProgressProps = {
  asset: AssetType;
};

function getNumericValue(value: string) {
  const numericValue = Number(value);

  return Number.isFinite(numericValue) ? numericValue : 0;
}

export function AssetSaleProgress({ asset }: AssetSaleProgressProps) {
  const { prices } = useAssetsContext();
  const primaryIssuance = prices[asset.address]?.primary_issuance;
  const totalTokens = getNumericValue(primaryIssuance?.max_amount_cap ?? "0");
  const soldTokens = getNumericValue(primaryIssuance?.total_bought ?? "0");
  const tokensLeft = Math.max(totalTokens - soldTokens, 0);
  const soldPercentage = Math.min(primaryIssuance?.progress_percent ?? 0, 100);
  const soldPercentageLabel =
    soldPercentage > 0 && soldPercentage < 1 ? "<1" : soldPercentage.toFixed(0);
  const isSoldOut = totalTokens > 0 && tokensLeft === 0;

  return (
    <div className={styles.saleProgress}>
      <div className={styles.saleProgressHeader}>
        <RText color="neutral-600" size="body-s">
          Tokens Left
        </RText>
        <RText size="body-s" weight="medium">
          <Money fiat tooltip={false}>
            {atomsToTokens(tokensLeft, asset.metadata.decimals)}
          </Money>
        </RText>
      </div>
      <div
        aria-label={soldPercentageLabel}
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
          {soldPercentageLabel}% sold
        </RText>
        <RText color="neutral-600" size="body-s">
          <Money tooltip={false} fiat>
            {atomsToTokens(totalTokens, asset.metadata.decimals)}
          </Money>{" "}
          total
        </RText>
      </div>
    </div>
  );
}
