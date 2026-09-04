import { generatePath, Link } from "@remix-run/react";

import { ROUTES } from "~/consts";
import type { AssetHighlightType } from "~/lib/apis/rwa/assets/assets.types";
import Money from "~/lib/atoms/Money";
import { RText } from "~/lib/atoms/RTypography/RText";
import styles from "./styles.module.css";
import { useAssetsContext } from "~/providers/AssetsProvider/assets.provider";

export function HighlightCard(props: { asset: AssetHighlightType }) {
  const { asset } = props;
  const { assets } = useAssetsContext();
  const price = asset.price.usd;
  const priceChange = asset.change_24h?.pct;
  const isNegative = (priceChange ?? 0) < 0;
  const imageUrl =
    assets.find((item) => item.address === asset.address)?.profile.image_url ??
    "";

  return (
    <Link
      to={generatePath(ROUTES.trade, { address: asset.address })}
      className={styles.cardWrapper}
    >
      <img
        alt=""
        className={styles.cardImage}
        decoding="async"
        fetchPriority="low"
        loading="lazy"
        src={imageUrl}
      />

      <div className={styles.cardContent}>
        <div className={styles.cardBlock}>
          <RText size="body-sm" weight="medium">
            {asset.symbol.replace("-usdt", "").toUpperCase()}
          </RText>
          <RText className={styles.assetName} size="body-s" color="neutral-700">
            {asset.name.replace("RWA", "").replace("Token", "")}
          </RText>
        </div>

        <div className={styles.priceBlock}>
          <RText size="body-sm" weight="medium">
            $<Money fiat>{price}</Money>
          </RText>
          {priceChange !== undefined && priceChange !== null ? (
            <RText
              className={styles.priceChange}
              size="body-s"
              color={isNegative ? "red-500" : "green-500"}
            >
              {isNegative ? "" : "+"}
              <Money fiat>{priceChange}</Money>%
            </RText>
          ) : (
            <RText
              className={styles.priceChange}
              size="body-s"
              color="neutral-700"
            >
              --
            </RText>
          )}
        </div>
      </div>
    </Link>
  );
}
