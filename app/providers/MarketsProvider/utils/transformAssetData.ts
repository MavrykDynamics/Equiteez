import {
  AssetData,
  EstateType,
} from "~/providers/MarketsProvider/market.types";
import { keysToCamelCase } from "~/providers/MarketsProvider/utils/keysToCamelCase";

export function transformAssetData(data: AssetData): EstateType {
  const asset = data.asset ?? {};
  const details = asset.asset_details ?? {};

  return {
    token_address: asset.token_address ?? "",
    name: asset.token_metadata?.name ?? "",
    symbol: asset.token_metadata?.symbol ?? "",
    decimals: Number(asset.token_metadata?.decimals ?? 0),
    icon: asset.token_metadata?.icon ?? asset.icon ?? "",
    assetType: asset.asset_type ?? "",

    assetDetails: {
      coordinates: details.coordinates ?? null,
      APY: details._a_p_y ?? null,
      type: details.type ?? "",
      assetImages: details.asset_images ?? [],
      previewImage: details.preview_image ?? "",

      basicInfo: details.basic_info ? keysToCamelCase(details.basic_info) : {},

      propertyDetails: details.property_details
        ? keysToCamelCase(details.property_details)
        : {},

      buildingInfo: details.building_info
        ? keysToCamelCase(details.building_info)
        : {},

      neighborhood: details.neighborhood
        ? keysToCamelCase(details.neighborhood)
        : {},

      financials: details.financials ? keysToCamelCase(details.financials) : {},

      blockchain: details.blockchain ? keysToCamelCase(details.blockchain) : [],

      offering: details.offering ? keysToCamelCase(details.offering) : {},

      valuation: details.valuation ? keysToCamelCase(details.valuation) : {},

      priceDetails: details.price_details
        ? keysToCamelCase(details.price_details)
        : {},
    },
  };
}
