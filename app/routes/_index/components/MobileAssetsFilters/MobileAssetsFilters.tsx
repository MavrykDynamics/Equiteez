import { useMemo } from "react";

import { RButton } from "~/lib/atoms/RButton";
import { RHeading } from "~/lib/atoms/RTypography/RHeading";
import { RIcon } from "~/lib/atoms/RIcon";
import { RTabSwitcher } from "~/lib/organisms/RTabSwitcher";
import { RViewSwitcher } from "~/lib/atoms/RViewSwitcher/RViewSwitcher";
import CustomPopup from "~/lib/organisms/CustomPopup/CustomPopup";
import { AssetsSort } from "~/routes/_index/components/AssetsFilters/AssetsSort";
import {
  ALL_ASSETS_FILTER_VALUE,
  INITIAL_ASSETS_FILTER_STATE,
  ASSET_SORT_OPTIONS,
} from "~/routes/_index/components/AssetsFilters/assetsFilters.const";
import { useAssetsContext } from "~/providers/AssetsProvider/assets.provider";
import type { AssetsFilterState } from "~/routes/_index/components/AssetsFilters/assetsFilters.types";

import styles from "./MobileAssetsFilters.module.css";

type MobileAssetsFiltersProps = {
  filters: AssetsFilterState;
  isOpen: boolean;
  onChange: (updates: Partial<AssetsFilterState>) => void;
  onClose: () => void;
};

export function MobileAssetsFilters({
  filters,
  isOpen,
  onChange,
  onClose,
}: MobileAssetsFiltersProps) {
  const { assets, assetTypes } = useAssetsContext();

  const filterTabs = useMemo(() => {
    const assetTypeCounts = assets.reduce<Record<string, number>>(
      (counts, asset) => {
        const assetType = asset.profile.asset_type;

        counts[assetType] = (counts[assetType] ?? 0) + 1;

        return counts;
      },
      {}
    );

    return [
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
  }, [assets, assetTypes]);

  return (
    <CustomPopup
      className={styles.popup}
      contentPosition="bottom"
      isOpen={isOpen}
      onRequestClose={onClose}
      overlayClassName={styles.overlay}
    >
      <div className={styles.header}>
        <RHeading size="h6" weight="medium">
          Filters
        </RHeading>
        <button
          aria-label="Close filters"
          className={styles.closeButton}
          onClick={onClose}
          type="button"
        >
          <RIcon aria-hidden="true" name="close" size="medium" />
        </button>
      </div>

      <div className={styles.body}>
        <div className={styles.row}>
        <div className={styles.search}>
          <RIcon aria-hidden="true" name="search" />
          <input
            aria-label="Search assets"
            className={styles.searchInput}
            onChange={(event) => onChange({ search: event.target.value })}
            placeholder="Search"
            value={filters.search}
          />
        </div>
        <RViewSwitcher
          onChange={(viewType) => onChange({ viewType })}
          value={filters.viewType}
          viewModes={["image", "grid"]}
        />
        </div>

        <div className={styles.tabsSection}>
          <div className={styles.tabsScroller}>
            <RTabSwitcher
              activeTabId={filters.filter}
              ariaLabel="Asset types"
              className={styles.tabs}
              onChange={(filter) => onChange({ filter })}
              tabs={filterTabs}
            />
          </div>
        </div>

        <div className={styles.row}>
          <AssetsSort
            className={styles.sort}
            onChange={(sort) => onChange({ sort })}
            options={ASSET_SORT_OPTIONS}
            value={filters.sort}
          />
        </div>

        <div className={styles.actions}>
          <RButton
            className={styles.actionButton}
            onClick={() => {
              onChange(INITIAL_ASSETS_FILTER_STATE);
              onClose();
            }}
            size="medium"
            tone="black"
            variant="secondary"
          >
            Reset All
          </RButton>
          <RButton
            className={styles.actionButton}
            onClick={onClose}
            size="medium"
            tone="black"
            variant="primary"
          >
            Apply
          </RButton>
        </div>
      </div>
    </CustomPopup>
  );
}
