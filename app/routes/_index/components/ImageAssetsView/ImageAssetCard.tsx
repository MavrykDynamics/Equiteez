import { motion, useInView, useReducedMotion } from "framer-motion";
import { generatePath, Link } from "@remix-run/react";
import { useEffect, useRef } from "react";

import { ROUTES } from "~/consts";
import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import Money from "~/lib/atoms/Money";
import { RIcon } from "~/lib/atoms/RIcon";
import { RText } from "~/lib/atoms/RTypography/RText";
import { RPriceChange } from "~/lib/molecules/RPriceChange";
import { useAssetPrice } from "~/providers/AssetsProvider/hooks/useAssetPrice";
import { AssetBadge } from "~/routes/_index/components/AssetBadge/AssetBadge";
import { AssetIdentity } from "~/routes/_index/components/AssetsCardsView/AssetIdentity";
import { AssetSaleProgress } from "~/routes/_index/components/AssetsCardsView/AssetSaleProgress";
import { AssetPriceChart } from "~/routes/_index/components/AssetPriceChart/AssetPriceChart";

import styles from "./ImageAssetsView.module.css";
import { AssetApyBadge } from "~/routes/_index/components/AssetBadge/AssetApyBadge";

const revealedImageAssetAddresses = new Set<string>();

type RImageAssetCardProps = {
  asset: AssetType;
  isCardInView?: boolean;
};

export function ImageAssetCard({ asset }: RImageAssetCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const imageUrl = asset.profile.image_url;

  const isCardInView = useInView(cardRef, {
    amount: 0.35,
    margin: "0px 0px -15% 0px",
    once: true,
  });

  return (
    <div className={styles.card} ref={cardRef}>
      <Link
        className={styles.cardLink}
        to={generatePath(ROUTES.trade, { address: asset.address })}
      >
        <div className={styles.media}>
          <img
            alt=""
            className={styles.image}
            decoding="async"
            loading="lazy"
            src={imageUrl}
          />
          <div aria-hidden="true" className={styles.imageOverlay} />
          <div className={styles.cardHeader}>
            <div className={styles.assetBadgeList}>
              <div className={styles.assetBadgeWrapper}>
                <AssetBadge asset={asset} />
              </div>
              <div className={styles.assetBadgeWrapper}>
                <AssetApyBadge asset={asset} />
              </div>
            </div>

            <RIcon
              aria-hidden="true"
              className={styles.arrowIcon}
              name="arrow-long-up-right"
            />
          </div>
        </div>

        <CardBody asset={asset} isCardInView={isCardInView} />
      </Link>
    </div>
  );
}

export function CardBody({ asset, isCardInView }: RImageAssetCardProps) {
  const { isNegative, points, price, priceChange } = useAssetPrice(asset);
  const isPrimaryIssuance = asset.profile.lifecycle === "primary_issuance";
  const wasPreviouslyRevealed = useRef(
    revealedImageAssetAddresses.has(asset.address)
  );
  const shouldReduceMotion = useReducedMotion();

  const shouldAnimateChartReveal =
    !wasPreviouslyRevealed.current && !shouldReduceMotion;

  useEffect(() => {
    if (wasPreviouslyRevealed.current || !isCardInView) {
      return;
    }

    revealedImageAssetAddresses.add(asset.address);
  }, [asset.address, isCardInView]);
  return (
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
              <RText color="neutral-700" size="body-s">
                Listing Price
              </RText>
              <span aria-hidden="true" className={styles.separator} />
              <RText color="neutral-700" size="body-s">
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
          <motion.div
            animate={
              shouldAnimateChartReveal
                ? isCardInView
                  ? {
                      clipPath: "inset(0% 0% 0% 0%)",
                      opacity: 1,
                    }
                  : {
                      clipPath: "inset(0% 100% 0% 0%)",
                      opacity: 0.85,
                    }
                : undefined
            }
            initial={
              shouldAnimateChartReveal
                ? {
                    clipPath: "inset(0% 100% 0% 0%)",
                    opacity: 0.85,
                  }
                : false
            }
            transition={{
              delay: 0.14,
              duration: 1.05,
              ease: [0.2, 0.8, 0.2, 1],
            }}
          >
            <AssetPriceChart
              animateOnReveal={!wasPreviouslyRevealed.current}
              className={styles.secondaryChart}
              isRevealed={isCardInView}
              points={points}
              tone={isNegative ? "negative" : "positive"}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}
