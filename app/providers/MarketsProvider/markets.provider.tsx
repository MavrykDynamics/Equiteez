import {
  FC,
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useQuery } from "@tanstack/react-query";

import fakeAssetsMocked from "app/mocks/assets.mock.json";

import { fetchAssets } from "~/lib/apis/mbrwa/assets";
import { toTokenSlug } from "~/lib/assets";
import { ApiError } from "~/errors/error";
import { withSortedFromMap } from "~/lib/utils";

import { MarketContext, EstateType } from "./market.types";
import {
  EMPTY_MARKET_ASSETS_COLLECTION,
  createMarketAssetsCollection,
  createMarketPickers,
  createValidTokensRecord,
} from "./utils";

export const marketsContext = createContext<MarketContext>(undefined!);

const createFakeMarkets = () =>
  fakeAssetsMocked.reduce<Map<string, EstateType>>((acc, asset) => {
    const slug = toTokenSlug(asset.token_address);

    acc.set(slug, {
      ...asset,
      slug,
    } as unknown as EstateType);

    return acc;
  }, new Map());

export const MarketsProvider: FC<PropsWithChildren> = ({ children }) => {
  const [activeMarketSlug, setActiveMarketSlug] = useState<string | null>(null);
  const [isActiveMarketLoading, setIsActiveMarketLoading] = useState(true);

  const bootstrapQuery = useQuery({
    queryKey: ["fetchAssets", "all"],
    queryFn: () => fetchAssets(),
  });

  const marketApiError = useMemo(
    () => (bootstrapQuery.error ? new ApiError(bootstrapQuery.error) : null),
    [bootstrapQuery.error]
  );

  const bootstrapCollection = useMemo(
    () =>
      bootstrapQuery.data
        ? createMarketAssetsCollection(bootstrapQuery.data.assets)
        : EMPTY_MARKET_ASSETS_COLLECTION,
    [bootstrapQuery.data]
  );

  const fakeMarkets = useMemo(() => createFakeMarkets(), []);

  const config = useMemo(
    () => ({
      orderbook: bootstrapCollection.orderbook,
    }),
    [bootstrapCollection.orderbook]
  );

  const markets = useMemo(
    () => new Map([...bootstrapCollection.markets, ...fakeMarkets]),
    [bootstrapCollection.markets, fakeMarkets]
  );

  const pickMarketByIdentifier = useCallback(
    (slug: string): EstateType | null => markets.get(slug) ?? null,
    [markets]
  );

  const activeMarket = useMemo(
    () => (activeMarketSlug ? pickMarketByIdentifier(activeMarketSlug) : null),
    [activeMarketSlug, pickMarketByIdentifier]
  );

  const updateActiveMarketState = useCallback((slug: string) => {
    setActiveMarketSlug(slug);
    setIsActiveMarketLoading(false);
  }, []);

  const marketsArr = useMemo(
    () => withSortedFromMap(markets, bootstrapCollection.sortedMarketAddresses),
    [markets, bootstrapCollection.sortedMarketAddresses]
  );

  const marketAddresses = useMemo(
    () =>
      Array.from(config.orderbook.values()).map(
        (entry) => entry.rwaTokenAddress
      ),
    [config.orderbook]
  );

  const orderbookAddresses = useMemo(
    () => Array.from(config.orderbook.values()).map((entry) => entry.address),
    [config.orderbook]
  );

  const pickers = useMemo(() => createMarketPickers(config), [config]);

  const validBaseTokens = useMemo(
    () => createValidTokensRecord(config.orderbook),
    [config.orderbook]
  );

  const isLoading = bootstrapQuery.isPending;

  const contextValue = useMemo<MarketContext>(
    () => ({
      config,
      markets,
      sortedMarketAddresses: bootstrapCollection.sortedMarketAddresses,
      isLoading,
      activeMarket,
      isActiveMarketLoading,
      marketAddresses,
      orderbookAddresses,
      marketsArr,
      pickMarketByIdentifier,
      updateActiveMarketState,
      validBaseTokens,
      marketApiError,
      pickers,
    }),
    [
      config,
      markets,
      bootstrapCollection.sortedMarketAddresses,
      isLoading,
      activeMarket,
      isActiveMarketLoading,
      marketAddresses,
      orderbookAddresses,
      marketsArr,
      pickMarketByIdentifier,
      updateActiveMarketState,
      validBaseTokens,
      marketApiError,
      pickers,
    ]
  );

  return (
    <marketsContext.Provider value={contextValue}>
      {children}
    </marketsContext.Provider>
  );
};

export const useMarketsContext = () => {
  const context = useContext(marketsContext);

  if (!context) {
    throw new Error("marketsContext should be used within MarketsProvider");
  }

  return context;
};
