import styles from "./styles.module.css";
import { HighlightCard } from "~/routes/_index/components/Highlights/HighlightCard";
import { RText } from "~/lib/atoms/RTypography/RText";
import { useQuery } from "@tanstack/react-query";
import { fetchAssetsHighlights } from "~/lib/apis/rwa";
import { Reveal } from "~/lib/atoms/Reveal/Reveal";
import useEmblaCarousel from "embla-carousel-react";
import type { AssetHighlightType } from "~/lib/apis/rwa/assets/assets.types";
import { Container } from "~/lib/atoms/Container/Container";
import { RSkeletonReveal } from "~/lib/atoms/RSkeleton";
import { HighlightsSkeleton } from "~/routes/_index/components/Highlights/HighlightsSkeleton";

type HighlightRowProps = {
  assets: AssetHighlightType[];
  title: string;
};

function MobileHighlightRow({ assets, title }: HighlightRowProps) {
  const [emblaRef] = useEmblaCarousel({
    align: "center",
    dragFree: true,
    loop: false,
    slidesToScroll: 1,
    breakpoints: {
      "(max-width: 670px)": {
        dragFree: false,
      },
    },
  });

  return (
    <section className={styles.mobileSection}>
      <RText weight="medium" className={styles.mobileSectionTitle}>
        {title}
      </RText>
      <div className={styles.mobileViewport} ref={emblaRef}>
        <div className={styles.mobileList}>
          {assets.map((asset) => (
            <div className={styles.mobileSlide} key={asset.address}>
              <HighlightCard asset={asset} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Highlights() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["rwa-assets-highlights"],
    queryFn: fetchAssetsHighlights,
  });

  if (isError && !data) {
    return (
      <Container className={styles.wrapper}>
        <RText color="neutral-700">Highlights are currently unavailable.</RText>
      </Container>
    );
  }

  const topGainers = data?.top_gainers ?? [];
  const trending = data?.trending ?? [];
  const newlyAdded = data?.newly_added ?? [];

  return (
    <RSkeletonReveal isLoading={isLoading} skeleton={<HighlightsSkeleton />}>
      <Container className={styles.wrapper}>
        <div className={styles.desktopSection}>
          <RText weight="medium">Top Gainers</RText>
          <div className={styles.sectionList}>
            {topGainers.map((asset, index) => (
              <Reveal
                className={styles.cardReveal}
                delay={Math.min(0.04 * (index + 1), 0.2)}
                key={asset.address}
                preset="rise"
              >
                <HighlightCard asset={asset} />
              </Reveal>
            ))}
          </div>
        </div>

        <div className={styles.desktopSection}>
          <RText weight="medium">Trending</RText>
          <div className={styles.sectionList}>
            {trending.map((asset, index) => (
              <Reveal
                className={styles.cardReveal}
                delay={Math.min(0.04 * (index + 1), 0.2)}
                key={asset.address}
                preset="rise"
              >
                <HighlightCard asset={asset} />
              </Reveal>
            ))}
          </div>
        </div>

        <div className={styles.desktopSection}>
          <RText weight="medium">Newly Added</RText>
          <div className={styles.sectionList}>
            {newlyAdded.map((asset, index) => (
              <Reveal
                className={styles.cardReveal}
                delay={Math.min(0.04 * (index + 1), 0.2)}
                key={asset.address}
                preset="rise"
              >
                <HighlightCard asset={asset} />
              </Reveal>
            ))}
          </div>
        </div>

        <div className={styles.mobileSections}>
          <MobileHighlightRow assets={topGainers} title="Top Gainers" />
          <MobileHighlightRow assets={trending} title="Trending" />
          <MobileHighlightRow assets={newlyAdded} title="Newly Added" />
        </div>
      </Container>
    </RSkeletonReveal>
  );
}
