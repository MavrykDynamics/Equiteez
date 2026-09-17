import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";

import styles from "./styles.module.css";

export function RWhyInvest({ asset }: { asset: AssetType }) {
  // TODO: Replace temporary Figma copy with asset-specific investment highlights from the API.
  const columns = [
    [
      {
        title: "Prime Location",
        description: `${asset.metadata.name} strategically targets properties in high-demand urban corridors. Each asset is selected for its proximity to transit, commerce, and growing residential communities.`,
      },
      {
        title: "Premium Assets",
        description:
          "The portfolio features Class A commercial spaces, luxury residential complexes, and mixed-use developments with best-in-class amenities and strong tenant retention rates.",
      },
    ],
    [
      {
        title: "High Rental Demand",
        description: `Strong investment fundamentals with a ${asset.apy.toFixed(2)}% projected dividend yield, driven by consistent occupancy rates and long-term lease agreements with creditworthy tenants.`,
      },
      {
        title: "Market Growth Trajectory",
        description:
          "Capitalize on accelerating urbanization and real estate demand, fueled by continued infrastructure investment, favorable interest rate trends, and positioning in top-tier metropolitan markets.",
      },
    ],
  ];

  return (
    <section className={styles.content} aria-label="Why Invest">
      <RHeading size="h6" weight="medium">
        Why Invest
      </RHeading>
      <div className={styles.investColumns}>
        {columns.map((items) => (
          <ul className={styles.investItems} key={items[0].title}>
            {items.map(({ title, description }) => (
              <li className={styles.investItem} key={title}>
                <div className={styles.investCopy}>
                  <RHeading size="h7" weight="medium">
                    {title}
                  </RHeading>
                  <RText color="neutral-700" size="body-sm">
                    {description}
                  </RText>
                </div>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}
