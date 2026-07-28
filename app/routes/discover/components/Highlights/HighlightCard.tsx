import styles from "./styles.module.css";
import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import Money from "~/lib/atoms/Money";
import { generatePath, Link } from "@remix-run/react";
import { RText } from "~/lib/atoms/RTypography/RText";
import { useAssetsContext } from "~/providers/AssetsProvider/assets.provider";
import { ROUTES } from "~/consts";

export function HighlightCard(props: { asset: AssetType }) {
  const { asset } = props;
  const { prices } = useAssetsContext();

  const assetPrices = prices[asset.address] ?? {};

  const priceChange = {
    amount: assetPrices.change_24h?.delta_abs ?? 0,
    percentage: assetPrices.change_24h?.change_pct ?? 0,
  };
  const isNegative = priceChange?.percentage < 0;
  return (
    <Link
      to={generatePath(ROUTES.trade, { address: asset.address })}
      className={styles.cardWrapper}
    >
      <div className={styles.cardBlock}>
        <RText size="body-sm" weight="medium">
          {asset.metadata.name}
        </RText>
        {/*TODO ask what value use here*/}
        <RText size="body-s" color="neutral-600">
          {asset.metadata.symbol}
        </RText>
      </div>

      <div className={styles.cardBlock}>
        <RText size="body-sm" weight="medium">
          $
          <Money fiat>
            {assetPrices.usd ??
              assetPrices.price ??
              asset.stats?.price.usd ??
              asset.finance.value_per_token}
          </Money>
        </RText>
        <RText size="body-s" color={isNegative ? "red-500" : "green-500"}>
          {isNegative ? "-" : "+"}
          <Money>{priceChange.percentage ?? 0}</Money>%
        </RText>
      </div>
    </Link>
  );
}
