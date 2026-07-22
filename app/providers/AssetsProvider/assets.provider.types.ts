import type { ReactNode } from "react";
import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";

export type AssetsProviderProps = {
  children: ReactNode;
};

export type AssetTypeOption = {
  label: string;
  value: string;
};

export type AssetsProviderContextType = {
  assets: AssetType[];
  assetTypes: Record<string, AssetTypeOption>;
  isLoading: boolean;
};
