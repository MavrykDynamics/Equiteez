import { Container } from "~/lib/atoms/Container/Container";
import { Highlights } from "~/routes/discover/components/Highlights/Highlights";
import { ExploreAssets } from "~/routes/discover/components/ExploreAssets/ExploreAssets";

export default function DiscoverOverview() {
  return (
      <Container>
        <Highlights />
        <ExploreAssets />
      </Container>
  );
}
