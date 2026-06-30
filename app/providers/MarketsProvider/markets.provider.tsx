import {
  FC,
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQuery } from "@tanstack/react-query";

import fakeAssetsMocked from "app/mocks/assets.mock.json";
import legacyRwasMocked from "app/mocks/rwas.json";

import { fetchAssets } from "~/lib/apis/mbrwa/assets";
import { fromAssetSlug, toTokenSlug } from "~/lib/assets";
import { ApiError } from "~/errors/error";
import { withSortedFromMap } from "~/lib/utils";
import {
  createFallbackTokenMetadata,
  type TokenMetadata,
} from "~/lib/metadata";

import { MarketContext, EstateType } from "./market.types";
import {
  EMPTY_MARKET_ASSETS_COLLECTION,
  createMarketAssetsCollection,
  createMarketPickers,
  createValidTokensRecord,
} from "./utils";
import { useTokensContext } from "~/providers/TokensProvider/tokens.provider";
import type { TokenType } from "~/providers/TokensProvider/tokens.provider.types";

export const marketsContext = createContext<MarketContext>(undefined!);

const fallbackAssetsMocked = [...fakeAssetsMocked, ...legacyRwasMocked];

const normalizeFallbackMarket = (asset: EstateType): EstateType => {
  const slug = toTokenSlug(asset.token_address);
  const [blockchain, ...restBlockchain] = asset.assetDetails.blockchain;

  return {
    ...asset,
    assetType: asset.assetType ?? "",
    slug,
    assetDetails: {
      ...asset.assetDetails,
      propertyDetails: {
        ...asset.assetDetails.propertyDetails,
        tags: asset.assetDetails.propertyDetails.tags ?? [],
      },
      blockchain: [
        {
          ...blockchain,
          identifier: asset.token_address,
        },
        ...restBlockchain,
      ],
    },
  };
};

const createFakeMarkets = () =>
  fallbackAssetsMocked.reduce<Map<string, EstateType>>((acc, asset) => {
    const market = normalizeFallbackMarket(asset as unknown as EstateType);

    acc.set(market.slug, market);

    return acc;
  }, new Map());

const createFallbackTokensData = (
  markets: Map<string, EstateType>
): {
  tokens: TokenType[];
  tokensMetadata: StringRecord<TokenMetadata>;
} => {
  const tokens: TokenType[] = [];
  const tokensMetadata: StringRecord<TokenMetadata> = {};

  markets.forEach((market) => {
    const [, id = "0"] = fromAssetSlug(market.slug);

    tokens.push({
      contract: market.token_address,
      id,
    });

    tokensMetadata[market.slug] = createFallbackTokenMetadata({
      address: market.token_address,
      decimals: market.decimals,
      id,
      name: market.name,
      symbol: market.symbol,
      thumbnailUri: market.icon || undefined,
    });
  });

  return { tokens, tokensMetadata };
};

export const MarketsProvider: FC<PropsWithChildren> = ({ children }) => {
  const [activeMarketSlug, setActiveMarketSlug] = useState<string | null>(null);
  const [isActiveMarketLoading, setIsActiveMarketLoading] = useState(true);
  const { upsertTokensData } = useTokensContext();

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

  const fallbackTokensData = useMemo(
    () => createFallbackTokensData(fakeMarkets),
    [fakeMarkets]
  );

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

  useEffect(() => {
    if (!fallbackTokensData.tokens.length) {
      return;
    }

    upsertTokensData(
      fallbackTokensData.tokens,
      fallbackTokensData.tokensMetadata
    );
  }, [fallbackTokensData, upsertTokensData]);

  useEffect(() => {
    if (!bootstrapCollection.tokens.length) {
      return;
    }

    upsertTokensData(
      bootstrapCollection.tokens,
      bootstrapCollection.tokensMetadata
    );
  }, [
    bootstrapCollection.tokens,
    bootstrapCollection.tokensMetadata,
    upsertTokensData,
  ]);

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
