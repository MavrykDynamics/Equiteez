import styles from "./styles.module.css";
import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import { Text } from "~/lib/atoms/Typography/Text";
import Money from "~/lib/atoms/Money";
import { Link } from "@remix-run/react";

export function HighlightCard(props: { asset: AssetType }) {
  const {asset} = props;
  
  return (
    //TODO add correct link
    <Link to="/" className={styles.cardWrapper}>
      <div className={styles.cardBlock}>
        <Text size="smallBody" weight="medium">
          {asset.metadata.name}
        </Text>
        <Text size="tinyBody" color="sand">
          {asset.metadata.symbol}
        </Text>
      </div>

      <div className={styles.cardBlock}>
        <Text size="smallBody" weight="medium">
          $<Money>{asset.stats?.price.usd ?? 0}</Money>
        </Text>
        <Text size="tinyBody" color="sand">
          $<Money>{asset.stats?.price.usd ?? 0}</Money>
        </Text>
      </div>
    </Link>
  );
}