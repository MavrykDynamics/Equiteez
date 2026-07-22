import styles from "./styles.module.css";
import { useAssetsContext } from "~/providers/AssetsProvider/assets.provider";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { AssetsFilters } from "~/routes/discover/components/AssetsFilters/AssetsFilters";
import { AssetsTableView } from "~/routes/discover/components/AssetsTableView/AssetsTableView";

export function ExploreAssets() {
  const { assets } = useAssetsContext();

  return (
    <div className={styles.wrapper}>
      <RHeading size="h5" weight="medium">
        Explore Assets
      </RHeading>
      <AssetsFilters />
      <AssetsTableView assets={assets} />
    </div>
  );
}
