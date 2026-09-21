import { useMemo } from "react";

import { RButton } from "~/lib/atoms/RButton";
import { RViewSwitcher } from "~/lib/atoms/RViewSwitcher/RViewSwitcher";
import CustomPopup from "~/lib/organisms/CustomPopup/CustomPopup";
import { RText } from "~/lib/atoms/RTypography/RText";
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
      <div className={styles.body}>
        <section className={styles.section}>
          <RText
            className={styles.sectionTitle}
            size="body-sm"
            color="neutral-700"
          >
            Filter
          </RText>
          <div
            className={styles.options}
            role="tablist"
            aria-label="Asset types"
          >
            {filterTabs.map((tab) => (
              <button
                aria-selected={filters.filter === tab.id}
                className={styles.option}
                data-selected={filters.filter === tab.id}
                key={tab.id}
                onClick={() => onChange({ filter: tab.id })}
                role="tab"
                type="button"
              >
                <RText size="body-sm">{tab.label}</RText>
                <RText size="body-s" color="neutral-700">
                  {tab.count}
                </RText>
              </button>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <RText
            className={styles.sectionTitle}
            size="body-sm"
            color="neutral-700"
          >
            Sort
          </RText>
          <div
            className={styles.options}
            role="tablist"
            aria-label="Asset sorting"
          >
            {ASSET_SORT_OPTIONS.map((option) => (
              <button
                aria-selected={filters.sort === option.value}
                className={styles.option}
                data-selected={filters.sort === option.value}
                key={option.value}
                onClick={() => onChange({ sort: option.value })}
                role="tab"
                type="button"
              >
                <RText size="body-sm">{option.label}</RText>
              </button>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <RText
            className={styles.sectionTitle}
            size="body-sm"
            color="neutral-700"
          >
            View
          </RText>
          <RViewSwitcher
            className={styles.viewSwitcher}
            onChange={(viewType) => onChange({ viewType })}
            value={filters.viewType}
            viewModes={["image", "grid", "list"]}
          />
        </section>

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
            Cancel
          </RButton>
          <RButton
            className={styles.actionButton}
            onClick={onClose}
            size="medium"
            tone="black"
            variant="primary"
          >
            Confirm
          </RButton>
        </div>
      </div>
    </CustomPopup>
  );
}
