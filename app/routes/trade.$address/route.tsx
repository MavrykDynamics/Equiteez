import { useParams } from "@remix-run/react";

import { AssetDetails } from "./components/AssetDetails/AssetDetails";
import PageLayout from "~/layouts/PageLayout/Pagelayout";
import { Container } from "~/lib/atoms/Container/Container";
import { useAssetsContext } from "~/providers/AssetsProvider/assets.provider";
import { AssetTabs } from "~/routes/trade.$address/components/AssetTabs/AssetTabs";
import { ChartBlock } from "~/routes/trade.$address/components/ChartBlock/ChartBlock";
import styles from "./styles.module.css";

export default function TradePage() {
  const { address } = useParams();
  const { assets } = useAssetsContext();
  const asset = assets.find((item) => item.address === address);

  if (!asset) {
    return <div>Asset not found</div>;
  }

  return (
    <PageLayout includeContainer={false}>
      <Container>
        <AssetDetails asset={asset} />
        <div className={styles.contentBlock}>
          <ChartBlock />
          <div className={styles.buySellContainer}></div>
        </div>
        <AssetTabs />
      </Container>
    </PageLayout>
  );
}
