import styles from "./styles.module.css";
import { RText } from "~/lib/atoms/RTypography/RText";
import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import Money from "~/lib/atoms/Money";

export function AssetApyBadge({ asset }: { asset: AssetType }) {
  return (
    <span className={styles.assetApyBadge}>
      <RText color="blue-900" size="body-s">
        APY{" "}
        <Money fiat tooltip={false}>
          {asset.apy}
        </Money>
        %
      </RText>
    </span>
  );
}
