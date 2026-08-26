import { Container } from "~/lib/atoms/Container/Container";
import { Highlights } from "~/routes/_index/components/Highlights/Highlights";
import { ExploreAssets } from "~/routes/_index/components/ExploreAssets/ExploreAssets";

export default function DiscoverOverview() {
  return (
      <Container>
        <Highlights />
        <ExploreAssets />
      </Container>
  );
}
