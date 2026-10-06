import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";
import assetsMock from "~/providers/AssetsProvider/consts/assets-mock.json";

import styles from "./styles.module.css";

type WhyInvestItem = {
  title: string;
  description: string;
};

const FALLBACK_COLUMN_SIZE = 2;

export function getAssetMock(asset: AssetType) {
  const assetAddress = asset.address.toLowerCase();

  return assetsMock.find((mockAsset) => {
    const mockContract = mockAsset.contract.toLowerCase();
    return mockContract === assetAddress;
  });
}

function getColumns(items: WhyInvestItem[]) {
  const columnSize = Math.ceil(items.length / FALLBACK_COLUMN_SIZE);

  return [items.slice(0, columnSize), items.slice(columnSize)];
}

export function RWhyInvest({ asset }: { asset: AssetType }) {
  const assetMock = getAssetMock(asset);
  const whyInvest = assetMock?.whyInvest ?? [];
  const columns = getColumns(whyInvest);

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
