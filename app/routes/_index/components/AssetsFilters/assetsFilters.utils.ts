import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import type { RTabSwitcherItem } from "~/lib/organisms/RTabSwitcher/RTabSwitcher";
import type { AssetTypeOption } from "~/providers/AssetsProvider/assets.provider.types";
import {
  ALL_ASSETS_FILTER_VALUE,
  PRIMARY_MARKET_FILTER_VALUE,
} from "./assetsFilters.const";

const isPrimaryMarket = (asset: AssetType) =>
  asset.market_type.toLowerCase() === "primary";

export const matchesAssetsFilter = (asset: AssetType, filter: string) => {
  if (filter === ALL_ASSETS_FILTER_VALUE) return true;
  if (filter === PRIMARY_MARKET_FILTER_VALUE) return isPrimaryMarket(asset);

  return asset.profile.asset_type === filter;
};

export const getAssetsFilterTabs = (
  assets: AssetType[],
  assetTypes: Record<string, AssetTypeOption>
): RTabSwitcherItem[] => {
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
    {
      count: assets.filter(isPrimaryMarket).length,
      id: PRIMARY_MARKET_FILTER_VALUE,
      label: "Primary",
    },
    ...Object.values(assetTypes).map((assetType) => ({
      count: assetTypeCounts[assetType.value] ?? 0,
      id: assetType.value,
      label: assetType.label,
    })),
  ];
};
