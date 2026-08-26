import { useEffect, useMemo, useState } from "react";

import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import { RPagination } from "~/lib/molecules/RPagination";
import { RText } from "~/lib/atoms/RTypography/RText";

import { ImageAssetCard } from "./ImageAssetCard";
import styles from "./ImageAssetsView.module.css";

const assetsPerPage = 12;

type RImageAssetsViewProps = {
  assets: AssetType[];
};

export function ImageAssetsView({ assets }: RImageAssetsViewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(assets.length / assetsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const firstAssetIndex = (safeCurrentPage - 1) * assetsPerPage;
  const displayedAssets = useMemo(
    () => assets.slice(firstAssetIndex, firstAssetIndex + assetsPerPage),
    [assets, firstAssetIndex]
  );

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const lastAssetIndex = firstAssetIndex + displayedAssets.length;

  return (
    <div className={styles.view}>
      <div className={styles.gridFrame}>
        <div className={styles.grid}>
          {displayedAssets.map((asset) => (
            <ImageAssetCard asset={asset} key={asset.address} />
          ))}
        </div>
      </div>

      <div className={styles.paginationRow}>
        <div className={styles.resultsSummary}>
          <RText color="neutral-500" size="body-s">
            Showing
          </RText>
          <RText size="body-s" weight="medium">
            {firstAssetIndex + 1}–{lastAssetIndex}
          </RText>
          <RText color="neutral-500" size="body-s">
            of {assets.length} assets
          </RText>
        </div>
        <RPagination
          currentPage={safeCurrentPage}
          onPageChange={setCurrentPage}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
}
