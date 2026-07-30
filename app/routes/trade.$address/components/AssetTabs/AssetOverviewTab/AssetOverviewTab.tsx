import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RText } from "~/lib/atoms/RTypography/RText";
import assetsMocked from "~/mocks/assets.mock.json";

import { AssetGallerySlider } from "./AssetGallerySlider";
import styles from "./styles.module.css";

export function AssetOverviewTab({ asset }: { asset: AssetType }) {
  const mockAsset =
    assetsMocked.find((item) => item.symbol === asset.metadata.symbol) ??
    assetsMocked[0];
  const images = [
    mockAsset.assetDetails.previewImage,
    ...mockAsset.assetDetails.assetImages,
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.galleryWrapper}>
        <AssetGallerySlider images={images} name={mockAsset.name} />
      </div>

      <div className={styles.content}>
        <RHeading size="h6" weight="medium">
          About {asset.metadata.name}
        </RHeading>
        <RText color="neutral-600" size="body-sm">
          {asset.profile.description}
        </RText>
      </div>
    </div>
  );
}
