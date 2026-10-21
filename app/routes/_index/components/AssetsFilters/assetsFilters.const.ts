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

export const PRIMARY_MARKET_FILTER_VALUE = "primary_market";

// When the search is expanded and there are more tabs than this, the extra ones collapse into a "+N" tab
export const MAX_FILTER_TABS_WITH_SEARCH = 5;
export const OVERFLOW_FILTER_TAB_ID = "overflow";

// Plural tab labels by asset_type; types missing here fall back to the formatted asset_type
export enum AssetTypePluralLabel {
  equity = "Equities",
  treasury_bill = "Treasury Bills",
  commodity = "Commodities",
}
