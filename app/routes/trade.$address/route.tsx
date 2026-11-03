import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useParams } from "@remix-run/react";
import clsx from "clsx";

import { AssetGallerySlider } from "./components/AssetGallery/AssetGallerySlider";
import { AssetDetails } from "./components/AssetDetails/AssetDetails";
import { Container } from "~/lib/atoms/Container/Container";
import { useAssetsContext } from "~/providers/AssetsProvider/assets.provider";
import { AssetTabs } from "~/routes/trade.$address/components/AssetTabs/AssetTabs";
import { BuySellPanel } from "~/routes/trade.$address/components/BuySellPanel/BuySellPanel";
import { ChartBlock } from "~/routes/trade.$address/components/ChartBlock/ChartBlock";
import { RChartStats } from "./components/ChartBlock/RChartStats";
import styles from "./styles.module.css";
import { RText } from "~/lib/atoms/RTypography/RText";
import { RButton } from "~/lib/atoms/RButton";
import { ROUTES } from "~/consts";
import { TABLET_WIDTH } from "~/hooks/useWindowDimensions";
import { RPrimarySaleSummary } from "./components/RPrimarySaleSummary/RPrimarySaleSummary";
import { RPrimaryPriceLabelGroup } from "./components/RPriceLabelGroup/RPrimaryPriceLabelGroup";
import { TradePageSkeleton } from "./components/TradePageSkeleton/TradePageSkeleton";
import { RSkeletonReveal } from "~/lib/atoms/RSkeleton";

const MOBILE_QUERY = `(max-width: ${TABLET_WIDTH}px)`;

const subscribeToMobileViewport = (onChange: () => void) => {
  const mediaQuery = window.matchMedia(MOBILE_QUERY);
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
};

// Server render assumes desktop so the desktop layout never remounts on hydrate
const useIsMobileViewport = () =>
  useSyncExternalStore(
    subscribeToMobileViewport,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false
  );

export default function TradePage() {
  const { address } = useParams();
  const { assets, assetError, isLoading } = useAssetsContext();
  const navigate = useNavigate();

  const asset = assets.find((item) => item.address === address);
  const [isOrderBookOpen, setIsOrderBookOpen] = useState(false);
  const isMobile = useIsMobileViewport();
  const isDesktop = !isMobile;
  const [orderBookContainer, setOrderBookContainer] =
    useState<HTMLDivElement | null>(null);
  // Mobile: the buy/sell panel moves into a swipeable slide next to the chart
  const [mobileBuySellSlot, setMobileBuySellSlot] =
    useState<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsOrderBookOpen(false);
  }, [address]);

  if (!asset) {
    // Same element type and position as the loaded page below, so React keeps
    // this RSkeletonReveal mounted and wipes the page in once assets arrive
    if (isLoading && !assets.length) {
      return (
        <RSkeletonReveal isLoading skeleton={<TradePageSkeleton />}>
          {null}
        </RSkeletonReveal>
      );
    }

    return (
      <Container className={styles.notFoundWrapper}>
        <RText size="body-l" weight="medium">
          {assetError
            ? "Unable to load assets. Please try again."
            : "Asset not found"}
        </RText>
        <RButton
          onClick={() => navigate(ROUTES.home)}
          variant="secondary"
          tone="black"
        >
          Back to Home page
        </RButton>
      </Container>
    );
  }

  const isPrimary = asset.profile.lifecycle === "primary_issuance";
  const gallery = (
    <AssetGallerySlider
      key={asset.address}
      images={asset.profile.gallery.map((item) => item.url)}
      name={asset.metadata.name}
      size={isPrimary ? "large" : "compact"}
      overlay={
        isPrimary ? (
          <div className={styles.primaryPrice}>
            <RPrimaryPriceLabelGroup assetAddress={asset.address} />
          </div>
        ) : undefined
      }
    />
  );

  const buySellPanel = (
    <div className={styles.buySellContainer}>
      <BuySellPanel
        key={`${asset.address}:${asset.orderbook?.address ?? ""}`}
        asset={asset}
        isPrimary={isPrimary}
        isOrderBookOpen={isOrderBookOpen}
        orderBookContainer={!isPrimary && isDesktop ? orderBookContainer : null}
        setIsOrderBookOpen={setIsOrderBookOpen}
      />
    </div>
  );

  return (
    <RSkeletonReveal isLoading={false} skeleton={null}>
      <Container className={styles.tradeContainer}>
        <RText
          className={styles.viewOnlyNotice}
          color="neutral-700"
          size="body-s"
        >
          View-only on mobile. Open on desktop to trade.
        </RText>
        <div className={clsx(styles.contentBlock, isPrimary && styles.primary)}>
          <div className={styles.mainContent}>
            <AssetDetails asset={asset} />
            {isPrimary ? (
              <div className={styles.primaryGallery}>
                {gallery}
                <RChartStats asset={asset} />
              </div>
            ) : (
              <div className={styles.chartSlider}>
                {/* Mobile: buy/sell card comes first, chart second */}
                <div
                  ref={setMobileBuySellSlot}
                  className={styles.buySellSlide}
                />
                <div className={styles.chartSlide}>
                  <ChartBlock
                    asset={asset}
                    isOrderBookOpen={isOrderBookOpen}
                    orderBookContainerRef={setOrderBookContainer}
                    onOrderBookToggle={() =>
                      setIsOrderBookOpen((isOpen) => !isOpen)
                    }
                  />
                </div>
              </div>
            )}
            {!isPrimary && (
              <div className={styles.chartStats}>
                <RChartStats asset={asset} />
              </div>
            )}
            {isPrimary ? (
              <div className={styles.primaryTabs}>
                <AssetTabs asset={asset} />
              </div>
            ) : (
              <AssetTabs asset={asset} />
            )}
          </div>

          <div className={styles.tradeColumn}>
            <div className={styles.tradeColumnContent}>
              {isPrimary ? (
                <RPrimarySaleSummary assetAddress={asset.address} />
              ) : (
                gallery
              )}
              {!isPrimary && isMobile && mobileBuySellSlot
                ? createPortal(buySellPanel, mobileBuySellSlot)
                : buySellPanel}
            </div>
          </div>
        </div>
      </Container>
    </RSkeletonReveal>
  );
}
