import { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import { AssetTypeOption } from "~/providers/AssetsProvider/assets.provider.types";

export function formatAssetTypeLabel(value: string) {
  return value
    .split("_")
    .filter(Boolean)
    .map(
      (part) => `${part.charAt(0).toUpperCase()}${part.slice(1).toLowerCase()}`
    )
    .join(" ");
}

export function getAssetTypeLabelsFromAssets(assets: AssetType[]) {
  return assets.reduce<Record<string, AssetTypeOption>>((types, asset) => {
    const value = asset.profile.asset_type;

    if (value) {
      types[value] = {
        value,
        label: formatAssetTypeLabel(value),
      };
    }

    return types;
  }, {});
}
