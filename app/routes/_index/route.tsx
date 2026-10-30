import { Container } from "~/lib/atoms/Container/Container";
import { Highlights } from "~/routes/_index/components/Highlights/Highlights";
import { ExploreAssets } from "~/routes/_index/components/ExploreAssets/ExploreAssets";
import { BannerBlock } from "~/routes/_index/components/BannerBlock/BannerBlock";

// Blocks are not wrapped in <Reveal>: it renders hidden on the server, which
// would hide the skeletons until hydration. Each block reveals itself instead.
export default function DiscoverOverview() {
  return (
    <>
      <section>
        <BannerBlock />
      </section>
      <section>
        <Highlights />
      </section>
      <Container>
        <section>
          <ExploreAssets />
        </section>
      </Container>
    </>
  );
}
