import styles from "./styles.module.css";
import { HighlightCard } from "~/routes/_index/components/Highlights/HighlightCard";
import { RText } from "~/lib/atoms/RTypography/RText";
import { useQuery } from "@tanstack/react-query";
import { fetchAssetsHighlights } from "~/lib/apis/rwa";
import { Reveal } from "~/lib/atoms/Reveal/Reveal";
import useEmblaCarousel from "embla-carousel-react";
import type { AssetHighlightType } from "~/lib/apis/rwa/assets/assets.types";
import { Container } from "~/lib/atoms/Container/Container";

type HighlightRowProps = {
  assets: AssetHighlightType[];
  isLoading: boolean;
  title: string;
};

function MobileHighlightRow({ assets, isLoading, title }: HighlightRowProps) {
  const [emblaRef] = useEmblaCarousel({
    align: "center",
    loop: false,
    slidesToScroll: 1,
  });

  const cards = isLoading ? Array.from({ length: 3 }) : assets;

  return (
    <section className={styles.mobileSection}>
      <RText weight="medium" className={styles.mobileSectionTitle}>{title}</RText>
      <div className={styles.mobileViewport} ref={emblaRef}>
        <div className={styles.mobileList}>
          {cards.map((asset, index) => (
            <div
              className={styles.mobileSlide}
              key={isLoading ? `${title}-${index}` : asset.address}
            >
              {isLoading ? (
                <div className={styles.cardSkeleton} aria-hidden="true">
                  <div className={styles.cardBlock}>
                    <div className={styles.skeletonTitle} />
                    <div className={styles.skeletonSubtitle} />
                  </div>
                  <div className={styles.cardBlock}>
                    <div className={styles.skeletonValue} />
                    <div className={styles.skeletonChange} />
                  </div>
                </div>
              ) : (
                <HighlightCard asset={asset} />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Highlights() {
  const { data, isLoading } = useQuery({
    queryKey: ["rwa-assets-highlights"],
    queryFn: fetchAssetsHighlights,
  });

  const topGainers = data?.top_gainers ?? [];
  const trending = data?.trending ?? [];
  const newlyAdded = data?.newly_added ?? [];

  const renderSkeletonCards = () =>
    Array.from({ length: 3 }, (_, index) => (
      <div className={styles.cardSkeleton} key={index} aria-hidden="true">
        <div className={styles.cardBlock}>
          <div className={styles.skeletonTitle} />
          <div className={styles.skeletonSubtitle} />
        </div>

        <div className={styles.cardBlock}>
          <div className={styles.skeletonValue} />
          <div className={styles.skeletonChange} />
        </div>
      </div>
    ));

  return (
    <Container className={styles.wrapper}>
      <div className={styles.desktopSection}>
        <RText weight="medium">Top Gainers</RText>
        <div className={styles.sectionList}>
          {isLoading
            ? renderSkeletonCards()
            : topGainers.map((asset, index) => (
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
          {isLoading
            ? renderSkeletonCards()
            : trending.map((asset, index) => (
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
          {isLoading
            ? renderSkeletonCards()
            : newlyAdded.map((asset, index) => (
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
        <MobileHighlightRow
          assets={topGainers}
          isLoading={isLoading}
          title="Top Gainers"
        />
        <MobileHighlightRow
          assets={trending}
          isLoading={isLoading}
          title="Trending"
        />
        <MobileHighlightRow
          assets={newlyAdded}
          isLoading={isLoading}
          title="Newly Added"
        />
      </div>
    </Container>
  );
}
