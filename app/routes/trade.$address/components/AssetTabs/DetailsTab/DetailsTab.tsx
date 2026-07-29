import { RIcon } from "~/lib/atoms/RIcon/RIcon";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";

import styles from "./DetailsTab.module.css";

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

export function DetailsTab() {
  return (
    <div className={styles.details}>
      {detailGroups.map((group) => (
        <section aria-labelledby={`${group.title}-heading`} key={group.title}>
          <RHeading id={`${group.title}-heading`} size="h7" weight="medium">
            {group.title}
          </RHeading>
          <ul className={styles.items}>
            {group.items.map((item) => (
              <li className={styles.item} key={item}>
                <span aria-hidden="true" className={styles.iconWrap}>
                  <RIcon className={styles.icon} name="check" size="small" />
                </span>
                <RText color="neutral-900" size="body-sm">
                  {item}
                </RText>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
