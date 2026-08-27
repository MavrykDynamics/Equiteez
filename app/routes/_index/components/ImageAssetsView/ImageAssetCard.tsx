import { useInView } from "framer-motion";
import { generatePath, Link } from "@remix-run/react";
import { useEffect, useRef } from "react";

import { ROUTES } from "~/consts";
import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import Money from "~/lib/atoms/Money";
import { RIcon } from "~/lib/atoms/RIcon";
import { RText } from "~/lib/atoms/RTypography/RText";
import { RPriceChange } from "~/lib/molecules/RPriceChange";
import { ASSET_IMAGE_URLS_BY_ADDRESS } from "~/mocks/asset-image-urls.mock";
import { useAssetPrice } from "~/providers/AssetsProvider/hooks/useAssetPrice";
import { AssetBadge } from "~/routes/_index/components/AssetBadge/AssetBadge";
import { AssetIdentity } from "~/routes/_index/components/AssetsCardsView/AssetIdentity";
import { AssetSaleProgress } from "~/routes/_index/components/AssetsCardsView/AssetSaleProgress";
import { AssetPriceChart } from "~/routes/_index/components/AssetPriceChart/AssetPriceChart";

import styles from "./ImageAssetsView.module.css";

const fallbackImageUrl = Object.values(ASSET_IMAGE_URLS_BY_ADDRESS)[0];
const revealedImageAssetAddresses = new Set<string>();

type RImageAssetCardProps = {
  asset: AssetType;
};

export function ImageAssetCard({ asset }: RImageAssetCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const wasPreviouslyRevealed = useRef(
    revealedImageAssetAddresses.has(asset.address)
  );
  const isCardInView = useInView(cardRef, {
    amount: 0.35,
    margin: "0px 0px -12% 0px",
    once: true,
  });
  const { isNegative, points, price, priceChange } = useAssetPrice(asset);
  const isPrimaryIssuance = asset.profile.lifecycle === "primary_issuance";
  const imageUrl =
    ASSET_IMAGE_URLS_BY_ADDRESS[asset.address] ?? fallbackImageUrl;

  useEffect(() => {
    if (wasPreviouslyRevealed.current || !isCardInView) {
      return;
    }

    revealedImageAssetAddresses.add(asset.address);
  }, [asset.address, isCardInView]);

  return (
    <div className={styles.card} ref={cardRef}>
      <Link
        className={styles.cardLink}
        to={generatePath(ROUTES.trade, { address: asset.address })}
      >
        <div className={styles.media}>
          <img alt="" className={styles.image} src={imageUrl} />
          <div aria-hidden="true" className={styles.imageOverlay} />
          <div className={styles.cardHeader}>
            <div className={styles.assetBadgeWrapper}>
              <AssetBadge asset={asset} />
            </div>
            <RIcon
              aria-hidden="true"
              className={styles.arrowIcon}
              name="arrow-long-up-right"
            />
          </div>
        </div>

        <div className={styles.cardBody}>
          <div className={styles.assetSummary}>
            <AssetIdentity asset={asset} />
            <div className={styles.priceSummary}>
              <RText size="body-m" weight="medium">
                $
                <Money fiat tooltip={false}>
                  {price}
                </Money>
              </RText>
              {isPrimaryIssuance ? (
                <div className={styles.listingPriceMeta}>
                  <RText color="neutral-600" size="body-s">
                    Listing Price
                  </RText>
                  <span aria-hidden="true" className={styles.separator} />
                  <RText color="neutral-600" size="body-s">
                    Fixed
                  </RText>
                </div>
              ) : (
                <RPriceChange
                  amount={priceChange.amount}
                  className={styles.priceChange}
                  percentage={priceChange.percentage}
                  showPeriodLabel
                />
              )}
            </div>
          </div>

          <div>
            {isPrimaryIssuance ? (
              <div className={styles.primaryProgress}>
                <AssetSaleProgress asset={asset} />
              </div>
            ) : (
              <AssetPriceChart
                animateOnReveal={!wasPreviouslyRevealed.current}
                className={styles.secondaryChart}
                isRevealed={isCardInView}
                points={points}
                tone={isNegative ? "negative" : "positive"}
              />
            )}

            <div className={styles.yieldRow}>
              <RText color="neutral-600" size="body-s">
                {isPrimaryIssuance ? "Projected Yield" : "Net yield"}
              </RText>
              <RText color="accent-green-500" size="body-s" weight="medium">
                <Money tooltip={false}>4.78</Money>%
              </RText>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
