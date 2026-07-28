import { useParams } from "@remix-run/react";

import { AssetDetails } from "./components/AssetDetails/AssetDetails";
import PageLayout from "~/layouts/PageLayout/Pagelayout";
import { Container } from "~/lib/atoms/Container/Container";
import { useAssetsContext } from "~/providers/AssetsProvider/assets.provider";

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
      </Container>
    </PageLayout>
  );
}
