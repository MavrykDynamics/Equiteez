import { Container } from "~/lib/atoms/Container/Container";
import { Reveal } from "~/lib/atoms/Reveal/Reveal";
import { Highlights } from "~/routes/_index/components/Highlights/Highlights";
import { ExploreAssets } from "~/routes/_index/components/ExploreAssets/ExploreAssets";
import { BannerBlock } from "~/routes/_index/components/BannerBlock/BannerBlock";

export default function DiscoverOverview() {
  return (
    <Container>
      <Reveal as="section" preset="image">
        <BannerBlock />
      </Reveal>
      <Reveal as="section" delay={0.08}>
        <Highlights />
      </Reveal>
      <Reveal as="section" delay={0.12}>
        <ExploreAssets />
      </Reveal>
    </Container>
  );
}
