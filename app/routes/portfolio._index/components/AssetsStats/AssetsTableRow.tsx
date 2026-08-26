import { RText } from "~/lib/atoms/RTypography/RText";

import type { WalletPortfolioAssetType } from "~/lib/apis/rwa/wallet/wallet.types";
import styles from "./styles.module.css";
import Money from "~/lib/atoms/Money";
import { RIcon } from "~/lib/atoms/RIcon";
import { AssetIcon } from "~/templates/AssetIcon";
import { toTokenSlug } from "~/lib/assets";

type AllAssetsTableRowProps = {
  asset: WalletPortfolioAssetType;
};

export function AssetsTableRow({ asset }: AllAssetsTableRowProps) {
  const isPositiveChange = (asset.price_change_30d_pct ?? 0) >= 0;
  const isPositiveProfit = (asset.profit ?? 0) >= 0;

  return (
    <tr>
      <td>
        <div className={styles.assetIdentity}>
          <AssetIcon
            size={24}
            assetSlug={toTokenSlug(asset.token_address)}
            className={styles.tokenIcon}
          />
          <span>
            <RText className={styles.blockText} size="body-sm" weight="medium">
              {asset.symbol.toUpperCase()}
            </RText>
            <RText
              className={styles.assetName}
              color="neutral-700"
              size="body-s"
            >
              {asset.name}
            </RText>
          </span>
        </div>
      </td>
      <td>
        <RText className={styles.blockText} size="body-sm" weight="medium">
          $
          <Money fiat tooltip={false}>
            {asset.value}
          </Money>
        </RText>
        <RText color="neutral-700" size="body-s">
          <Money fiat tooltip={false}>
            {asset.balance}
          </Money>
        </RText>
      </td>
      <td>
        <RText size="body-sm">
          {asset.avg_price === null ? (
            "—"
          ) : (
            <>
              $
              <Money fiat tooltip={false}>
                {asset.avg_price}
              </Money>
            </>
          )}
        </RText>
      </td>
      <td>
        <RText className={styles.blockText} size="body-sm">
          $
          <Money fiat tooltip={false}>
            {asset.price}
          </Money>
        </RText>
        {asset.price_change_30d_pct === null ? (
          <RText color="neutral-700" size="body-s">
            —
          </RText>
        ) : (
          <RText
            color={isPositiveChange ? "green-500" : "red-500"}
            size="body-s"
          >
            <RIcon
              className={
                isPositiveChange ? styles.positiveChange : styles.negativeChange
              }
              name={isPositiveChange ? "trending-up" : "trending-down"}
              size="small"
            />
            {isPositiveChange ? "+" : "-"}
            <Money fiat tooltip={false}>
              {Math.abs(asset.price_change_30d_pct)}
            </Money>
            %
          </RText>
        )}
      </td>
      <td>
        <RText size="body-sm">
          {asset.yield_pct === null ? (
            "—"
          ) : (
            <>
              <Money fiat tooltip={false}>
                {asset.yield_pct}
              </Money>
              %
            </>
          )}
        </RText>
      </td>
      <td>
        {asset.profit === null ? (
          <RText size="body-sm">—</RText>
        ) : (
          <>
            <RText
              color={isPositiveProfit ? "green-500" : "red-500"}
              className={styles.blockText}
              size="body-sm"
            >
              <Money fiat tooltip={false}>
                {asset.profit}
              </Money>
            </RText>
            <RText
              color={isPositiveProfit ? "green-500" : "red-500"}
              size="body-s"
            >
              <Money fiat tooltip={false}>
                {asset.profit_pct ?? 0}
              </Money>
              %
            </RText>
          </>
        )}
      </td>
    </tr>
  );
}
