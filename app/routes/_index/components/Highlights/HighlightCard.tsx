import styles from "./styles.module.css";
import { AssetHighlightType } from "~/lib/apis/rwa/assets/assets.types";
import Money from "~/lib/atoms/Money";
import { generatePath, Link } from "@remix-run/react";
import { RText } from "~/lib/atoms/RTypography/RText";
import { ROUTES } from "~/consts";

export function HighlightCard(props: { asset: AssetHighlightType }) {
  const { asset } = props;
  const price = asset.price.usd;
  const priceChange = asset.change_24h?.pct;
  const isNegative = (priceChange ?? 0) < 0;

  return (
    <Link
      to={generatePath(ROUTES.trade, { address: asset.address })}
      className={styles.cardWrapper}
    >
      <div className={styles.cardBlock}>
        <RText size="body-sm" weight="medium">
          {asset.name.replace("RWA", "").replace("Token", "")}
        </RText>
        <RText size="body-s" color="neutral-600">
          {asset.symbol.replace("-usdt", "").toUpperCase()}
        </RText>
      </div>

      <div className={styles.cardBlock}>
        <RText size="body-sm" weight="medium">
          $<Money fiat>{price}</Money>
        </RText>
        {priceChange !== undefined && priceChange !== null ? (
          <RText size="body-s" color={isNegative ? "red-500" : "green-500"}>
            {isNegative ? "" : "+"}
            <Money fiat>{priceChange}</Money>%
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
