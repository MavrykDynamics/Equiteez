import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import { RIcon } from "~/lib/atoms/RIcon";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";
import { getAssetMock } from "./RWhyInvest";

import styles from "./styles.module.css";

export function RAssetLocation({ asset }: { asset: AssetType }) {
  const location = getAssetMock(asset)?.location ?? "";

  return (
    <section className={styles.location} aria-label="Location">
      <RHeading size="h6" weight="medium">
        Location
      </RHeading>
      <RText color="neutral-700" size="body-sm">
        {location}
      </RText>
      <div
        className={styles.map}
        role="img"
        aria-label="Static location map placeholder"
      >
        <span className={styles.mapMarker}>
          <span className={styles.mapPin}>
            <RIcon name="house" />
          </span>
        </span>
      </div>
    </section>
  );
}
