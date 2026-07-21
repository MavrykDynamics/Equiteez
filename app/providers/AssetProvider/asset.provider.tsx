import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchAssets } from "~/lib/apis/rwa/assets/assets";
import type {
  AssetProviderContextType,
  AssetProviderProps,
} from "~/providers/AssetProvider/asset.provider.types";
import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";

const AssetContext = createContext<AssetProviderContextType | null>(null);

export function AssetProvider({ children }: AssetProviderProps) {
  const [assets, setAssets] = useState<AssetType[]>([]);
  const [loading, setLoading] = useState(true);

  const assetsQuery = useQuery({
    queryKey: ["rwa-assets"],
    queryFn: fetchAssets,
  });

  useEffect(() => {
    if (!assetsQuery.data) {
      return;
    }

    setAssets(assetsQuery.data.items);
  }, [assetsQuery.data]);

  useEffect(() => {
    setLoading(
      assetsQuery.isLoading || assetsQuery.isFetching || assetsQuery.isPending
    );
  }, [assetsQuery.isFetching, assetsQuery.isLoading, assetsQuery.isPending]);

  const contextValue = useMemo<AssetProviderContextType>(
    () => ({
      assets,
      loading,
    }),
    [assets, loading]
  );

  return (
    <AssetContext.Provider value={contextValue}>
      {children}
    </AssetContext.Provider>
  );
}

export function useAssetContext() {
  const context = useContext(AssetContext);

  if (!context) {
    throw new Error("useAssetContext must be used within AssetProvider");
  }

  return context;
}
