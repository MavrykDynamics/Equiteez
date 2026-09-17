import styles from "./styles.module.css";
import { RText } from "~/lib/atoms/RTypography/RText";
import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";

export function AssetApyBadge({ asset }: { asset: AssetType }) {
  return (
    <span className={styles.assetApyBadge}>
      <RText color="blue-900" size="body-s">
        APY 2.05%
      </RText>
    </span>
  );
}
