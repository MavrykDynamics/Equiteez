import { useEffect, useState } from "react";
import { useNavigate, useParams } from "@remix-run/react";

import { AssetGallerySlider } from "./components/AssetGallery/AssetGallerySlider";
import { AssetDetails } from "./components/AssetDetails/AssetDetails";
import { Container } from "~/lib/atoms/Container/Container";
import { useAssetsContext } from "~/providers/AssetsProvider/assets.provider";
import { AssetTabs } from "~/routes/trade.$address/components/AssetTabs/AssetTabs";
import { BuySellPanel } from "~/routes/trade.$address/components/BuySellPanel/BuySellPanel";
import { ChartBlock } from "~/routes/trade.$address/components/ChartBlock/ChartBlock";
import styles from "./styles.module.css";
import { RText } from "~/lib/atoms/RTypography/RText";
import { RButton } from "~/lib/atoms/RButton";
import { ROUTES } from "~/consts";

export default function TradePage() {
  const { address } = useParams();
  const { assets, assetError } = useAssetsContext();
  const navigate = useNavigate();

  const asset = assets.find((item) => item.address === address);
  const [isOrderBookOpen, setIsOrderBookOpen] = useState(false);

  useEffect(() => {
    setIsOrderBookOpen(false);
  }, [address]);

  if (!asset) {
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

  return (
    <Container>
      <div className={styles.contentBlock}>
        <div className={styles.mainContent}>
          <AssetDetails asset={asset} />
          <ChartBlock
            asset={asset}
            isOrderBookOpen={isOrderBookOpen}
            onOrderBookToggle={() => setIsOrderBookOpen((isOpen) => !isOpen)}
          />
          <AssetTabs asset={asset} />
        </div>

        <div className={styles.tradeColumn}>
          <AssetGallerySlider
            key={asset.address}
            images={asset.profile.gallery.map((item) => item.url)}
            name={asset.metadata.name}
          />
          <div className={styles.buySellContainer}>
            <BuySellPanel
              key={`${asset.address}:${asset.orderbook?.address ?? ""}`}
              asset={asset}
              isOrderBookOpen={isOrderBookOpen}
              setIsOrderBookOpen={setIsOrderBookOpen}
            />
          </div>
        </div>
      </div>
    </Container>
  );
}
