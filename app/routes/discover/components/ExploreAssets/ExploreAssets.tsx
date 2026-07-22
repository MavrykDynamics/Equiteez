import styles from "./styles.module.css";
import { useMemo, useState } from "react";
import { useAssetsContext } from "~/providers/AssetsProvider/assets.provider";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { AssetsFilters } from "~/routes/discover/components/AssetsFilters/AssetsFilters";
import { AssetsTableView } from "~/routes/discover/components/AssetsTableView/AssetsTableView";
import {
  ALL_ASSETS_FILTER_VALUE,
  INITIAL_ASSETS_FILTER_STATE,
} from "~/routes/discover/components/AssetsFilters/assetsFilters.const";
import type { AssetsFilterState } from "~/routes/discover/components/AssetsFilters/assetsFilters.types";
import { RText } from "~/lib/atoms/RTypography/RText";

export function ExploreAssets() {
  const { assets } = useAssetsContext();
  const [filters, setFilters] = useState<AssetsFilterState>(
    INITIAL_ASSETS_FILTER_STATE
  );

  const filteredAssets = useMemo(() => {
    const normalizedSearch = filters.search.trim().toLowerCase();

    return assets.filter((asset) => {
      const matchesFilter =
        filters.filter === ALL_ASSETS_FILTER_VALUE ||
        asset.profile.asset_type === filters.filter;
      const matchesSearch =
        !normalizedSearch ||
        asset.address.toLowerCase().includes(normalizedSearch) ||
        asset.metadata.symbol.toLowerCase().includes(normalizedSearch) ||
        asset.metadata.name.toLowerCase().includes(normalizedSearch);

      return matchesFilter && matchesSearch;
    });
  }, [assets, filters.filter, filters.search]);

  return (
    <div className={styles.wrapper}>
      <RHeading size="h5" weight="medium">
        Explore Assets
      </RHeading>
      <AssetsFilters
        filters={filters}
        onChange={(updates: Partial<AssetsFilterState>) =>
          setFilters((currentFilters) => ({
            ...currentFilters,
            ...updates,
          }))
        }
      />
      {filteredAssets.length ? (
        <AssetsTableView assets={filteredAssets} />
      ) : (
        <div className={styles.emptyState}>
          <RText size="body-sm" color="neutral-600">No Results Found</RText>
        </div>
      )}
    </div>
  );
}
