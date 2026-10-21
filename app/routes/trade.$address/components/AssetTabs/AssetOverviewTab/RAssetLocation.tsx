import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import { RIcon } from "~/lib/atoms/RIcon";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";

import styles from "./styles.module.css";

const getCountryName = (countryCode: string) => {
  try {
    return (
      new Intl.DisplayNames(["en"], { type: "region" }).of(countryCode) ??
      countryCode
    );
  } catch {
    return countryCode;
  }
};

export function RAssetLocation({ asset }: { asset: AssetType }) {
  const location = asset.profile.location;
  const description = location?.description?.trim();
  const label = [
    location?.name,
    location?.city,
    location?.country ? getCountryName(location.country) : undefined,
  ]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(", ");
  const coordinates = location?.coordinates;

  if (!description && !label && !coordinates) return null;

  return (
    <section className={styles.location} aria-label="Location">
      <RHeading size="h6" weight="medium">
        Location
      </RHeading>
      {label ? (
        <RText size="body-sm" weight="medium">
          {label}
        </RText>
      ) : null}
      {description ? (
        <RText
          className={styles.multilineText}
          color="neutral-700"
          size="body-sm"
        >
          {description}
        </RText>
      ) : null}
      {coordinates ? (
        <div
          className={styles.map}
          role="img"
          aria-label={`Location map at ${coordinates.lat}, ${coordinates.lng}`}
        >
          <span className={styles.mapMarker}>
            <span className={styles.mapPin}>
              <RIcon name="house" />
            </span>
          </span>
        </div>
      ) : null}
    </section>
  );
}
