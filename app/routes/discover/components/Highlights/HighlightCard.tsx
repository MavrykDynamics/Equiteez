import styles from "./styles.module.css";
import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import Money from "~/lib/atoms/Money";
import { Link } from "@remix-run/react";
import { RText } from "~/lib/atoms/RTypography/RText";

export function HighlightCard(props: { asset: AssetType }) {
  const { asset } = props;

  return (
    //TODO add correct link
    <Link to="/" className={styles.cardWrapper}>
      <div className={styles.cardBlock}>
        <RText size="body-sm" weight="medium">
          {asset.metadata.name}
        </RText>
        {/*TODO ask what value use here*/}
        <RText size="body-s" color="neutral-600">
          {asset.metadata.symbol}
        </RText>
      </div>

      <div className={styles.cardBlock}>
        <RText size="body-sm" weight="medium">
          $<Money>{asset.stats?.price.usd ?? 0}</Money>
        </RText>
        {/*TODO ask what value use here*/}
        <RText size="body-s" color="green-500">
          +<Money>{asset.stats?.price.usd ?? 0}</Money>%
        </RText>
      </div>
    </Link>
  );
}
