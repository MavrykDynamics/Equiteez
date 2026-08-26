import { Container } from "~/lib/atoms/Container/Container";
import { Highlights } from "~/routes/_index/components/Highlights/Highlights";
import { ExploreAssets } from "~/routes/_index/components/ExploreAssets/ExploreAssets";
import { BannerBlock } from "~/routes/_index/components/BannerBlock/BannerBlock";

export default function DiscoverOverview() {
  return (
      <Container>
        <BannerBlock />
        <Highlights />
        <ExploreAssets />
      </Container>
  );
}
