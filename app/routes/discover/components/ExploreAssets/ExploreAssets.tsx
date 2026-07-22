import styles from "./styles.module.css";
import { Text } from "~/lib/atoms/Typography/Text";
import { useAssetsContext } from "~/providers/AssetsProvider/assets.provider";
import { useMemo } from "react";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";

export function ExploreAssets() {
  const { assets } = useAssetsContext();

  return (
    <div className={styles.wrapper}>
      <RHeading size="h5" weight="medium">Explore Assets</RHeading>
    </div>
  );
}
