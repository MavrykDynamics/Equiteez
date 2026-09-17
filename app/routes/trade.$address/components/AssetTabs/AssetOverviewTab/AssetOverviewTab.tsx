import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";
import { AssetGallerySlider } from "./AssetGallerySlider";
import styles from "./styles.module.css";
import { RIcon } from "~/lib/atoms/RIcon";

type DetailGroup = {
  title: string;
  items: string[];
};

// TODO remove mock data. Temporary Figma-aligned data until the asset details API exposes these fields.
const detailGroups: DetailGroup[] = [
  {
    title: "Features",
    items: [
      "Deluxe Rooms",
      "Family Suites",
      "Signature Villas",
      "Business Lounge",
      "Event Space",
    ],
  },
  {
    title: "Amenities",
    items: [
      "Restaurants & Bars",
      "Beach & Pool",
      "Fitness Center",
      "SPA & Wellness",
      "Water Sports",
    ],
  },
];

export function AssetOverviewTab({ asset }: { asset: AssetType }) {
  const images = asset.profile.gallery.map((item) => item.url);

  return (
    <div className={styles.wrapper}>
      <div className={styles.galleryWrapper}>
        <AssetGallerySlider images={images} name={asset.metadata.name} />
      </div>

      <div className={styles.content}>
        <RHeading size="h6" weight="medium">
          About {asset.metadata.name}
        </RHeading>
        <RText color="neutral-700" size="body-sm">
          {asset.profile.description}
        </RText>
      </div>

      <div className={styles.details}>
        {detailGroups.map((group) => (
          <section aria-labelledby={`${group.title}-heading`} key={group.title}>
            <RHeading id={`${group.title}-heading`} size="h6" weight="medium">
              {group.title}
            </RHeading>
            <ul className={styles.items}>
              {group.items.map((item) => (
                <li className={styles.item} key={item}>
                  <span aria-hidden="true" className={styles.iconWrap}>
                    <RIcon className={styles.icon} name="check" size="small" />
                  </span>
                  <RText color="neutral-black" size="body-sm">
                    {item}
                  </RText>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
