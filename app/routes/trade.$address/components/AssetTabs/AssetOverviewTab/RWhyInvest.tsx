import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";

import styles from "./styles.module.css";

type WhyInvestItem = NonNullable<AssetType["profile"]["why_invest"]>[number];

const COLUMNS_COUNT = 2;

function getColumns(items: WhyInvestItem[]) {
  const columnSize = Math.ceil(items.length / COLUMNS_COUNT);

  return [items.slice(0, columnSize), items.slice(columnSize)].filter(
    (column) => column.length > 0
  );
}

export function RWhyInvest({ asset }: { asset: AssetType }) {
  const whyInvest = asset.profile.why_invest ?? [];

  if (!whyInvest.length) return null;

  const columns = getColumns(whyInvest);

  return (
    <section className={styles.content} aria-label="Why Invest">
      <RHeading size="h6" weight="medium">
        Why Invest
      </RHeading>
      <div className={styles.investColumns}>
        {columns.map((items, columnIndex) => (
          <ul className={styles.investItems} key={columnIndex}>
            {items.map(({ title, description }, itemIndex) => (
              <li className={styles.investItem} key={`${itemIndex}-${title}`}>
                <div className={styles.investCopy}>
                  <RHeading size="h7" weight="medium">
                    {title}
                  </RHeading>
                  <RText
                    className={styles.multilineText}
                    color="neutral-700"
                    size="body-sm"
                  >
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
