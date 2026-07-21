import styles from "./styles.module.css";
import { Text } from "~/lib/atoms/Typography/Text";
import { useAssetsContext } from "~/providers/AssetsProvider/assets.provider";
import { useMemo } from "react";
import { HighlightCard } from "~/routes/discover/components/Highlights/HighlightCard";

export function Highlights() {
  const { assets } = useAssetsContext();

  const topGainers = useMemo(() => assets.slice(0, 3), [assets]);
  const trending = useMemo(() => assets.slice(0, 3), [assets]);
  const newlyAdded = useMemo(() => assets.slice(0, 3), [assets]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.section}>
        <Text weight="medium">Top Gainers</Text>
        <div className={styles.sectionList}>
          {topGainers.map((asset) => (
            <HighlightCard asset={asset} key={asset.address} />
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <Text weight="medium">Trending</Text>
        <div className={styles.sectionList}>
          {trending.map((asset) => (
            <HighlightCard asset={asset} key={asset.address} />
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <Text weight="medium">Newly Added</Text>
        <div className={styles.sectionList}>
          {newlyAdded.map((asset) => (
            <HighlightCard asset={asset} key={asset.address} />
          ))}
        </div>
      </div>
    </div>
  );
}
