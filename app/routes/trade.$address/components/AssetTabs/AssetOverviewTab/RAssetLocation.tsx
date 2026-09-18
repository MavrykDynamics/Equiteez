import { RIcon } from "~/lib/atoms/RIcon";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";

import styles from "./styles.module.css";

export function RAssetLocation() {
  // TODO: Replace the static Figma location copy and map mockup with the real asset map.
  return (
    <section className={styles.location} aria-label="Location">
      <RHeading size="h6" weight="medium">
        Location
      </RHeading>
      <RText color="neutral-700" size="body-sm">
        Sun Belt corridor spanning Phoenix to Dallas, where population inflows
        outpace housing starts and pro-development zoning keeps entitlement
        timelines short. Low property-tax jurisdictions and year-round
        construction seasons compress time-to-lease across industrial,
        multifamily, and retail verticals.
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
