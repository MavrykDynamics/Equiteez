import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";
import styles from "./styles.module.css";
import { RIcon } from "~/lib/atoms/RIcon";
import { RWhyInvest } from "./RWhyInvest";
import { RAssetLocation } from "./RAssetLocation";

type DetailGroup = {
  title: string;
  items: string[];
};

export function AssetOverviewTab({ asset }: { asset: AssetType }) {
  const detailGroups: DetailGroup[] = [
    {
      title: "Features",
      items: asset.profile.features?.map((feature) => feature.name) ?? [],
    },
    {
      title: "Amenities",
      items: asset.profile.amenities?.map((amenity) => amenity.name) ?? [],
    },
  ].filter((group) => group.items.length > 0);

  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <RHeading size="h6" weight="medium">
          About {asset.metadata.name}
        </RHeading>
        <RText color="neutral-700" size="body-sm">
          {asset.profile.description}
        </RText>
      </div>

      <RWhyInvest asset={asset} />

      {detailGroups.length > 0 && (
        <div className={styles.details}>
          {detailGroups.map((group) => (
            <section
              aria-labelledby={`${group.title}-heading`}
              key={group.title}
            >
              <RHeading id={`${group.title}-heading`} size="h6" weight="medium">
                {group.title}
              </RHeading>
              <ul className={styles.items}>
                {group.items.map((item) => (
                  <li className={styles.item} key={item}>
                    <span aria-hidden="true" className={styles.iconWrap}>
                      <RIcon
                        className={styles.icon}
                        name="check"
                        size="small"
                      />
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
      )}
      <RAssetLocation />
    </div>
  );
}
