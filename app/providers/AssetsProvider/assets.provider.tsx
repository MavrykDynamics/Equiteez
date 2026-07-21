import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchAssets } from "~/lib/apis/rwa/assets/assets";
import type {
  AssetsProviderContextType,
  AssetsProviderProps,
} from "~/providers/AssetsProvider/assets.provider.types";
import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";

const AssetsContext = createContext<AssetsProviderContextType | null>(null);

export function AssetsProvider({ children }: AssetsProviderProps) {
  const [assets, setAssets] = useState<AssetType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    setIsLoading(
      assetsQuery.isLoading || assetsQuery.isFetching || assetsQuery.isPending
    );
  }, [assetsQuery.isFetching, assetsQuery.isLoading, assetsQuery.isPending]);

  const contextValue = useMemo<AssetsProviderContextType>(
    () => ({
      assets,
      isLoading,
    }),
    [assets, isLoading]
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
