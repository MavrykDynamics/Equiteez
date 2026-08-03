import styles from "./styles.module.css";
import { HighlightCard } from "~/routes/discover/components/Highlights/HighlightCard";
import { RText } from "~/lib/atoms/RTypography/RText";
import { useQuery } from "@tanstack/react-query";
import { fetchAssetsHighlights } from "~/lib/apis/rwa";

export function Highlights() {
  const { data } = useQuery({
    queryKey: ["rwa-assets-highlights"],
    queryFn: fetchAssetsHighlights,
  });

  const topGainers = data?.top_gainers ?? [];
  const trending = data?.trending ?? [];
  const newlyAdded = data?.newly_added ?? [];

  return (
    <div className={styles.wrapper}>
      <div className={styles.section}>
        <RText weight="medium">Top Gainers</RText>
        <div className={styles.sectionList}>
          {topGainers.map((asset) => (
            <HighlightCard asset={asset} key={asset.address} />
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <RText weight="medium">Trending</RText>
        <div className={styles.sectionList}>
          {trending.map((asset) => (
            <HighlightCard asset={asset} key={asset.address} />
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <RText weight="medium">Newly Added</RText>
        <div className={styles.sectionList}>
          {newlyAdded.map((asset) => (
            <HighlightCard asset={asset} key={asset.address} />
          ))}
        </div>
      </div>
    </div>
  );
}
