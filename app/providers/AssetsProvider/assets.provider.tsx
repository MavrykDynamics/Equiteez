import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchAssets } from "~/lib/apis/rwa/assets/assets";
import type {
  AssetTypeOption,
  AssetsProviderContextType,
  AssetsProviderProps,
} from "~/providers/AssetsProvider/assets.provider.types";
import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import { getAssetTypeLabelsFromAssets } from "~/providers/AssetsProvider/helpers/formatAssetTypeLabel";

const AssetsContext = createContext<AssetsProviderContextType | null>(null);

export function AssetsProvider({ children }: AssetsProviderProps) {
  const [assets, setAssets] = useState<AssetType[]>([]);
  const [assetTypes, setAssetTypes] = useState<Record<string, AssetTypeOption>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);

  const assetsQuery = useQuery({
    queryKey: ["rwa-assets"],
    queryFn: fetchAssets,
  });

  useEffect(() => {
    if (!assetsQuery.data) {
      return;
    }

    const nextAssets = assetsQuery.data.items;
    const nextAssetTypes = getAssetTypeLabelsFromAssets(nextAssets);

    setAssets(nextAssets);
    setAssetTypes(nextAssetTypes);
  }, [assetsQuery.data]);

  useEffect(() => {
    setIsLoading(
      assetsQuery.isLoading || assetsQuery.isFetching || assetsQuery.isPending
    );
  }, [assetsQuery.isFetching, assetsQuery.isLoading, assetsQuery.isPending]);

  const contextValue = useMemo<AssetsProviderContextType>(
    () => ({
      assets,
      assetTypes,
      isLoading,
    }),
    [assets, assetTypes, isLoading]
  );

  return (
    <AssetsContext.Provider value={contextValue}>
      {children}
    </AssetsContext.Provider>
  );
}

export function useAssetsContext() {
  const context = useContext(AssetsContext);

  if (!context) {
    throw new Error("useAssetsContext must be used within AssetsProvider");
  }

  return context;
}
