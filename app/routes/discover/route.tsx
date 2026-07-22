import PageLayout from "~/layouts/PageLayout/Pagelayout";
import { Container } from "~/lib/atoms/Container/Container";
import { Highlights } from "~/routes/discover/components/Highlights/Highlights";
import { ExploreAssets } from "~/routes/discover/components/ExploreAssets/ExploreAssets";

export default function DiscoverOverview() {
  return (
    <PageLayout includeContainer={false}>
      <Container>
        <Highlights />
        <ExploreAssets />
      </Container>
    </PageLayout>
  );
}
