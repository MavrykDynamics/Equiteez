import type { ReactNode } from "react";
import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";

export type AssetProviderProps = {
  children: ReactNode;
};

export type AssetProviderContextType = {
  assets: AssetType[];
  loading: boolean;
};
