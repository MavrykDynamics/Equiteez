import styles from "./styles.module.css";
import { RTabSwitcher } from "~/lib/organisms/RTabSwitcher";
import { RInput } from "~/lib/atoms/RInput/RInput";
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
        <RInput
          className={styles.search}
          icon="search"
          onChange={(event) => onChange({ search: event.target.value })}
          placeholder="Search"
          value={filters.search}
        />
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
