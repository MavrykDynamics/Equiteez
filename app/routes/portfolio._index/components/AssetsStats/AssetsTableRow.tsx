import { RText } from "~/lib/atoms/RTypography/RText";

import type { PortfolioAsset } from "~/routes/portfolio._index/components/AssetsStats/types";
import styles from "./styles.module.css";
import Money from "~/lib/atoms/Money";
import { RIcon } from "~/lib/atoms/RIcon";

type AllAssetsTableRowProps = {
  asset: PortfolioAsset;
};

export function AssetsTableRow({ asset }: AllAssetsTableRowProps) {
  const isPositiveChange = asset.changePercentage >= 0;
  const isPositiveProfit = (asset.profit ?? 0) >= 0;

  return (
    <tr>
      <td>
        <div className={styles.assetIdentity}>
          {asset.iconUrl ? (
            <img alt="" className={styles.assetIcon} src={asset.iconUrl} />
          ) : (
            <span aria-hidden="true" className={styles.tokenIcon}>
              {asset.symbol.slice(0, 1)}
            </span>
          )}
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
            {asset.amount}
          </Money>
        </RText>
        <RText color="neutral-700" size="body-s">
          <Money fiat tooltip={false}>
            {asset.quantity}
          </Money>
        </RText>
      </td>
      <td>
        <RText size="body-sm">
          $
          <Money fiat tooltip={false}>
            {asset.averagePrice}
          </Money>
        </RText>
      </td>
      <td>
        <RText className={styles.blockText} size="body-sm">
          $
          <Money fiat tooltip={false}>
            {asset.price}
          </Money>
        </RText>
        <RText color={isPositiveChange ? "green-500" : "red-500"} size="body-s">
          <RIcon
            className={
              isPositiveChange ? styles.positiveChange : styles.negativeChange
            }
            name={isPositiveChange ? "trending-up" : "trending-down"}
            size="small"
          />
          {isPositiveChange ? "+" : "-"}
          <Money fiat tooltip={false}>
            {asset.changePercentage}
          </Money>
          %
        </RText>
      </td>
      <td>
        <RText size="body-sm">
          {asset.yield === null ? (
            "—"
          ) : (
            <>
              <Money fiat tooltip={false}>
                {asset.yield}
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
                {(asset.profit / asset.value) * 100}
              </Money>
              %
            </RText>
          </>
        )}
      </td>
    </tr>
  );
}
