import type { ReactNode } from "react";
import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import type { PriceAssetType } from "~/lib/apis/rwa/prices/prices.types";

export type AssetsProviderProps = {
  children: ReactNode;
};

export type AssetTypeOption = {
  label: string;
  value: string;
};

export type AssetsProviderContextType = {
  assets: AssetType[];
  prices: Record<string, PriceAssetType>;
  assetTypes: Record<string, AssetTypeOption>;
  isLoading: boolean;
  isPricesLoading: boolean;
};
