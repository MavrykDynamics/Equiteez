import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetchAssets } from "~/lib/apis/rwa/assets/assets";
import { fetchPrices } from "~/lib/apis/rwa/prices/prices";
import type {
  AssetTypeOption,
  AssetsProviderContextType,
  AssetsProviderProps,
} from "~/providers/AssetsProvider/assets.provider.types";
import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import type { PriceAssetType } from "~/lib/apis/rwa/prices/prices.types";
import { getAssetTypeLabelsFromAssets } from "~/providers/AssetsProvider/helpers/formatAssetTypeLabel";
import { mapPricesByTokenAddress } from "~/providers/AssetsProvider/helpers/mapPricesByTokenAddress";
import { metadata } from "framer-motion/m";

const AssetsContext = createContext<AssetsProviderContextType | null>(null);

export function AssetsProvider({ children }: AssetsProviderProps) {
  const [assets, setAssets] = useState<AssetType[]>([]);
  const [prices, setPrices] = useState<Record<string, PriceAssetType>>({});
  const [assetTypes, setAssetTypes] = useState<Record<string, AssetTypeOption>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isPricesLoading, setIsPricesLoading] = useState(true);

  const assetsQuery = useQuery({
    queryKey: ["rwa-assets"],
    queryFn: fetchAssets,
  });

  const pricesQuery = useQuery({
    queryKey: ["rwa-prices"],
    queryFn: fetchPrices,
    refetchInterval: 60000,
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    if (!assetsQuery.data) {
      return;
    }

    const nextAssets = assetsQuery.data.items.map((item) => ({
      ...item,
      metadata: {
        ...item.metadata,
        name: item.metadata.name.replace("RWA", "").replace("Token", ""),
      },
    }));
    const nextAssetTypes = getAssetTypeLabelsFromAssets(nextAssets);

    setAssets(nextAssets);
    setAssetTypes(nextAssetTypes);
  }, [assetsQuery.data]);

  useEffect(() => {
    if (!pricesQuery.data) {
      return;
    }

    setPrices(mapPricesByTokenAddress(pricesQuery.data.assets));
  }, [pricesQuery.data]);

  useEffect(() => {
    setIsLoading(
      assetsQuery.isLoading || assetsQuery.isFetching || assetsQuery.isPending
    );
  }, [assetsQuery.isFetching, assetsQuery.isLoading, assetsQuery.isPending]);

  useEffect(() => {
    setIsPricesLoading(
      pricesQuery.isLoading || pricesQuery.isFetching || pricesQuery.isPending
    );
  }, [pricesQuery.isFetching, pricesQuery.isLoading, pricesQuery.isPending]);

  const contextValue = useMemo<AssetsProviderContextType>(
    () => ({
      assets,
      prices,
      assetTypes,
      isLoading,
      isPricesLoading,
    }),
    [assets, prices, assetTypes, isLoading, isPricesLoading]
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
