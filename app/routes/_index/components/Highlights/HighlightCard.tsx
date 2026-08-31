import { generatePath, Link } from "@remix-run/react";

import { ROUTES } from "~/consts";
import type { AssetHighlightType } from "~/lib/apis/rwa/assets/assets.types";
import Money from "~/lib/atoms/Money";
import { RText } from "~/lib/atoms/RTypography/RText";
import { ASSET_IMAGE_URLS_BY_ADDRESS } from "~/mocks/asset-image-urls.mock";

import styles from "./styles.module.css";

const fallbackImageUrl = Object.values(ASSET_IMAGE_URLS_BY_ADDRESS)[0];

export function HighlightCard(props: { asset: AssetHighlightType }) {
  const { asset } = props;
  const price = asset.price.usd;
  const priceChange = asset.change_24h?.pct;
  const isNegative = (priceChange ?? 0) < 0;
  const imageUrl =
    ASSET_IMAGE_URLS_BY_ADDRESS[asset.address] ?? fallbackImageUrl;

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
              color="neutral-600"
            >
              --
            </RText>
          )}
        </div>
      </div>
    </Link>
  );
}
