import type {
  AssetsFilterState,
  AssetsSortOption,
} from "./assetsFilters.types";

export const ALL_ASSETS_FILTER_VALUE = "all";

export const ASSET_SORT_OPTIONS: AssetsSortOption[] = [
  { label: "Trending", value: "trending" },
];

export const INITIAL_ASSETS_FILTER_STATE: AssetsFilterState = {
  filter: ALL_ASSETS_FILTER_VALUE,
  search: "",
  sort: ASSET_SORT_OPTIONS[0].value,
  viewType: "image",
};
