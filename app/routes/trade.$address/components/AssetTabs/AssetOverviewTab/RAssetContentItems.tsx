import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";

import styles from "./styles.module.css";

type AssetContentItem = NonNullable<
  AssetType["profile"]["why_invest"]
>[number];

const COLUMNS_COUNT = 2;

function getColumns(items: AssetContentItem[]) {
  const columnSize = Math.ceil(items.length / COLUMNS_COUNT);

  return [items.slice(0, columnSize), items.slice(columnSize)].filter(
    (column) => column.length > 0
  );
}

type RAssetContentItemsProps = {
  title: string;
  items: AssetContentItem[] | undefined;
};

/** Titled two-column list of title + description items (Why Invest, How it works). */
export function RAssetContentItems({ title, items }: RAssetContentItemsProps) {
  if (!items?.length) return null;

  const columns = getColumns(items);

  return (
    <section className={styles.content} aria-label={title}>
      <RHeading size="h6" weight="medium">
        {title}
      </RHeading>
      <div className={styles.investColumns}>
        {columns.map((columnItems, columnIndex) => (
          <ul className={styles.investItems} key={columnIndex}>
            {columnItems.map(({ title: itemTitle, description }, itemIndex) => (
              <li
                className={styles.investItem}
                key={`${itemIndex}-${itemTitle}`}
              >
                <div className={styles.investCopy}>
                  <RHeading size="h7" weight="medium">
                    {itemTitle}
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
