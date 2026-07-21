import type { ReactNode } from "react";
import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";

export type AssetsProviderProps = {
  children: ReactNode;
};

export type AssetsProviderContextType = {
  assets: AssetType[];
  isLoading: boolean;
};
