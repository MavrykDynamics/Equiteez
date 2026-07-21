import PageLayout from "~/layouts/PageLayout/Pagelayout";
import { Container } from "~/lib/atoms/Container/Container";
import { Highlights } from "~/routes/discover/components/Highlights/Highlights";

export default function DiscoverOverview() {
  return (
    <PageLayout includeContainer={false}>
      <Container>
        <Highlights />
      </Container>
    </PageLayout>
  );
}
