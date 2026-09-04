import { useEffect, useRef, useState } from "react";

import styles from "./styles.module.css";
import { RTabSwitcher } from "~/lib/organisms/RTabSwitcher";
import { RIcon } from "~/lib/atoms/RIcon";
import { RViewSwitcher } from "~/lib/atoms/RViewSwitcher/RViewSwitcher";
import { AssetsSort } from "./AssetsSort";
import {
  ALL_ASSETS_FILTER_VALUE,
  ASSET_SORT_OPTIONS,
} from "./assetsFilters.const";
import type { AssetsFilterState } from "./assetsFilters.types";
import { useAssetsContext } from "~/providers/AssetsProvider/assets.provider";

type AssetsFiltersProps = {
  filters: AssetsFilterState;
  onChange: (updates: Partial<AssetsFilterState>) => void;
};

export function AssetsFilters({ filters, onChange }: AssetsFiltersProps) {
  const { assets, assetTypes } = useAssetsContext();
  const [isSearchExpanded, setIsSearchExpanded] = useState(
    Boolean(filters.search)
  );
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchExpanded) {
      searchInputRef.current?.focus();
    }
  }, [isSearchExpanded]);

  const assetTypeCounts = assets.reduce<Record<string, number>>(
    (counts, asset) => {
      const assetType = asset.profile.asset_type;

      counts[assetType] = (counts[assetType] ?? 0) + 1;

      return counts;
    },
    {}
  );
  const filterTabs = [
    {
      count: assets.length,
      id: ALL_ASSETS_FILTER_VALUE,
      label: "All",
    },
    ...Object.values(assetTypes).map((assetType) => ({
      count: assetTypeCounts[assetType.value] ?? 0,
      id: assetType.value,
      label: assetType.label,
    })),
  ];

  return (
    <div className={styles.wrapper}>
      <RTabSwitcher
        activeTabId={filters.filter}
        ariaLabel="Asset types"
        onChange={(filter) => onChange({ filter })}
        tabs={filterTabs}
      />
      <div className={styles.rightBlock}>
        <div
          className={styles.search}
          data-expanded={isSearchExpanded}
        >
          {isSearchExpanded ? (
            <>
              <RIcon aria-hidden="true" name="search" />
              <input
                aria-label="Search assets"
                className={styles.searchInput}
                onBlur={() => {
                  if (!filters.search) {
                    setIsSearchExpanded(false);
                  }
                }}
                onChange={(event) => onChange({ search: event.target.value })}
                onKeyDown={(event) => {
                  if (event.key === "Escape" && !filters.search) {
                    setIsSearchExpanded(false);
                  }
                }}
                placeholder="Search"
                ref={searchInputRef}
                value={filters.search}
              />
            </>
          ) : (
            <button
              aria-label="Open asset search"
              className={styles.searchButton}
              onClick={() => setIsSearchExpanded(true)}
              type="button"
            >
              <RIcon aria-hidden="true" name="search" />
            </button>
          )}
        </div>
        <AssetsSort
          onChange={(sort) => onChange({ sort })}
          options={ASSET_SORT_OPTIONS}
          value={filters.sort}
        />
        <RViewSwitcher
          onChange={(viewType) => onChange({ viewType })}
          value={filters.viewType}
        />
      </div>
    </div>
  );
}
