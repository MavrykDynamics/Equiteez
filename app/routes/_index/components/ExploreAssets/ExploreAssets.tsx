import styles from "./styles.module.css";
import { useMemo, useState } from "react";
import { useAssetsContext } from "~/providers/AssetsProvider/assets.provider";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { AssetsFilters } from "~/routes/_index/components/AssetsFilters/AssetsFilters";
import { AssetsTableView } from "~/routes/_index/components/AssetsTableView/AssetsTableView";
import { AssetsCardsView } from "~/routes/_index/components/AssetsCardsView/AssetsCardsView";
import { ImageAssetsView } from "~/routes/_index/components/ImageAssetsView/ImageAssetsView";
import {
  ALL_ASSETS_FILTER_VALUE,
  INITIAL_ASSETS_FILTER_STATE,
} from "~/routes/_index/components/AssetsFilters/assetsFilters.const";
import type { AssetsFilterState } from "~/routes/_index/components/AssetsFilters/assetsFilters.types";
import { RText } from "~/lib/atoms/RTypography/RText";
import { Reveal } from "~/lib/atoms/Reveal/Reveal";
import FiltersIcon from "app/icons/filters.svg?react";
import { MobileAssetsFilters } from "~/routes/_index/components/MobileAssetsFilters/MobileAssetsFilters";

export function ExploreAssets() {
  const { assets } = useAssetsContext();
  const [filters, setFilters] = useState<AssetsFilterState>(
    INITIAL_ASSETS_FILTER_STATE
  );
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const filteredAssets = useMemo(() => {
    const normalizedSearch = filters.search.trim().toLowerCase();

    return assets
      .filter((asset) => {
        const matchesFilter =
          filters.filter === ALL_ASSETS_FILTER_VALUE ||
          asset.profile.asset_type === filters.filter;
        const matchesSearch =
          !normalizedSearch ||
          asset.address.toLowerCase().includes(normalizedSearch) ||
          asset.metadata.symbol.toLowerCase().includes(normalizedSearch) ||
          asset.metadata.name.toLowerCase().includes(normalizedSearch);

        return matchesFilter && matchesSearch;
      })
      .sort((leftAsset, rightAsset) => {
        const leftIsPrimaryIssuance =
          leftAsset.profile.lifecycle === "primary_issuance";
        const rightIsPrimaryIssuance =
          rightAsset.profile.lifecycle === "primary_issuance";

        if (leftIsPrimaryIssuance === rightIsPrimaryIssuance) {
          return 0;
        }

        return leftIsPrimaryIssuance ? -1 : 1;
      });
  }, [assets, filters.filter, filters.search]);

  return (
    <div className={styles.wrapper}>
      <Reveal className={styles.titleReveal} preset="rise">
        <div className={styles.titleBlock}>
          <RHeading size="h5" weight="medium">
            Explore Assets
          </RHeading>
          <button
            aria-label="Open filters"
            className={styles.mobileFiltersButton}
            onClick={() => {
              if (filters.viewType === "list") {
                setFilters((currentFilters) => ({
                  ...currentFilters,
                  viewType: "grid",
                }));
              }

              setIsMobileFiltersOpen(true);
            }}
            type="button"
          >
            <FiltersIcon aria-hidden="true" height={24} width={24} />
          </button>
          {/*<DepositFunds />*/}
        </div>
      </Reveal>

      <Reveal className={styles.desktopFilters} delay={0.06} preset="rise">
        <AssetsFilters
          filters={filters}
          onChange={(updates: Partial<AssetsFilterState>) =>
            setFilters((currentFilters) => ({
              ...currentFilters,
              ...updates,
            }))
          }
        />
      </Reveal>
      <MobileAssetsFilters
        filters={filters}
        isOpen={isMobileFiltersOpen}
        onChange={(updates: Partial<AssetsFilterState>) =>
          setFilters((currentFilters) => ({
            ...currentFilters,
            ...updates,
          }))
        }
        onClose={() => setIsMobileFiltersOpen(false)}
      />
      {filteredAssets.length ? (
        <Reveal delay={0.1} preset="rise">
          {filters.viewType === "image" ? (
            <ImageAssetsView assets={filteredAssets} />
          ) : filters.viewType === "grid" ? (
            <AssetsCardsView assets={filteredAssets} />
          ) : (
            <AssetsTableView assets={filteredAssets} />
          )}
        </Reveal>
      ) : (
        <Reveal delay={0.1} preset="fade">
          <div className={styles.emptyState}>
            <RText size="body-sm" color="neutral-700">
              No Results Found
            </RText>
          </div>
        </Reveal>
      )}
    </div>
  );
}
