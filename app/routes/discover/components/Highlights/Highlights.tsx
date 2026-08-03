import styles from "./styles.module.css";
import { HighlightCard } from "~/routes/discover/components/Highlights/HighlightCard";
import { RText } from "~/lib/atoms/RTypography/RText";
import { useQuery } from "@tanstack/react-query";
import { fetchAssetsHighlights } from "~/lib/apis/rwa";

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
    <div className={styles.wrapper}>
      <div className={styles.section}>
        <RText weight="medium">Top Gainers</RText>
        <div className={styles.sectionList}>
          {isLoading
            ? renderSkeletonCards()
            : topGainers.map((asset) => (
                <HighlightCard asset={asset} key={asset.address} />
              ))}
        </div>
      </div>

      <div className={styles.section}>
        <RText weight="medium">Trending</RText>
        <div className={styles.sectionList}>
          {isLoading
            ? renderSkeletonCards()
            : trending.map((asset) => (
                <HighlightCard asset={asset} key={asset.address} />
              ))}
        </div>
      </div>

      <div className={styles.section}>
        <RText weight="medium">Newly Added</RText>
        <div className={styles.sectionList}>
          {isLoading
            ? renderSkeletonCards()
            : newlyAdded.map((asset) => (
                <HighlightCard asset={asset} key={asset.address} />
              ))}
        </div>
      </div>
    </div>
  );
}
