import { useEffect, useRef, useState } from "react";

import styles from "./styles.module.css";
import { RTabSwitcher } from "~/lib/organisms/RTabSwitcher";
import { RIcon } from "~/lib/atoms/RIcon";
import { RViewSwitcher } from "~/lib/atoms/RViewSwitcher/RViewSwitcher";
import { AssetsSort } from "./AssetsSort";
import {
  ASSET_SORT_OPTIONS,
  MAX_FILTER_TABS_WITH_SEARCH,
  OVERFLOW_FILTER_TAB_ID,
} from "./assetsFilters.const";
import { getAssetsFilterTabs } from "./assetsFilters.utils";
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
  // Stays true until the search finishes its collapse animation, so the tabs don't expand while the search is still wide
  const [isSearchWide, setIsSearchWide] = useState(isSearchExpanded);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchExpanded) {
      setIsSearchWide(true);
      searchInputRef.current?.focus();
    }
  }, [isSearchExpanded]);

  const filterTabs = getAssetsFilterTabs(assets, assetTypes);
  const hasOverflowTabs =
    isSearchWide && filterTabs.length > MAX_FILTER_TABS_WITH_SEARCH;
  const visibleFilterTabs = hasOverflowTabs
    ? filterTabs.slice(0, MAX_FILTER_TABS_WITH_SEARCH - 1)
    : filterTabs;
  const hiddenFilterTabs = filterTabs.slice(visibleFilterTabs.length);
  const isActiveFilterHidden = hiddenFilterTabs.some(
    (tab) => tab.id === filters.filter
  );
  const switcherTabs = hasOverflowTabs
    ? [
        ...visibleFilterTabs,
        {
          id: OVERFLOW_FILTER_TAB_ID,
          label: `+${hiddenFilterTabs.length}`,
        },
      ]
    : filterTabs;
  const activeFilterTabId = isActiveFilterHidden
    ? OVERFLOW_FILTER_TAB_ID
    : filters.filter;

  return (
    <div className={styles.wrapper}>
      <RTabSwitcher
        activeTabId={activeFilterTabId}
        ariaLabel="Asset types"
        onChange={(filter) => {
          if (filter === OVERFLOW_FILTER_TAB_ID) {
            setIsSearchExpanded(false);
            return;
          }

          onChange({ filter });
        }}
        tabs={switcherTabs}
      />
      <div className={styles.rightBlock}>
        <div
          className={styles.search}
          data-expanded={isSearchExpanded}
          onTransitionEnd={(event) => {
            if (
              event.target === event.currentTarget &&
              event.propertyName === "width" &&
              !isSearchExpanded
            ) {
              setIsSearchWide(false);
            }
          }}
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
