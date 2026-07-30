import styles from "./styles.module.css";
import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import Money from "~/lib/atoms/Money";
import { generatePath, Link } from "@remix-run/react";
import { RText } from "~/lib/atoms/RTypography/RText";
import { ROUTES } from "~/consts";
import { useAssetPrice } from "~/providers/AssetsProvider/hooks/useAssetPrice";

export function HighlightCard(props: { asset: AssetType }) {
  const { asset } = props;
  const { price, priceChange, isNegative } = useAssetPrice(asset);
  return (
    <Link
      to={generatePath(ROUTES.trade, { address: asset.address })}
      className={styles.cardWrapper}
    >
      <div className={styles.cardBlock}>
        <RText size="body-sm" weight="medium">
          {asset.metadata.name}
        </RText>
        <RText size="body-s" color="neutral-600">
          {asset.metadata.symbol}
        </RText>
      </div>

      <div className={styles.cardBlock}>
        <RText size="body-sm" weight="medium">
          $<Money fiat>{price}</Money>
        </RText>
        {priceChange.percentage ? (
          <RText size="body-s" color={isNegative ? "red-500" : "green-500"}>
            {isNegative ? "" : "+"}
            <Money fiat>{priceChange.percentage ?? 0}</Money>%
          </RText>
        ) : (
          <RText size="body-s" color="neutral-600">
            --
          </RText>
        )}
      </div>
    </Link>
  );
}
