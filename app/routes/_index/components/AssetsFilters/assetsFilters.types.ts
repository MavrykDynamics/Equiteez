import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import type { RViewMode } from "~/lib/atoms/RViewSwitcher/RViewSwitcher";

export type AssetsFilterState = {
  filter: string;
  search: string;
  sort: string;
  viewType: RViewMode;
};

export type AssetsSortOption = {
  label: string;
  value: string;
};
