import styles from "./styles.module.css";
import { Text } from "~/lib/atoms/Typography/Text";
import { useAssetsContext } from "~/providers/AssetsProvider/assets.provider";
import { useMemo } from "react";
import { Heading } from "~/lib/atoms/Typography/Heading";

export function ExploreAssets() {
  const { assets } = useAssetsContext();

  return (
    <div className={styles.wrapper}>
      <Heading level="4">Explore Assets</Heading>
    </div>
  );
}
