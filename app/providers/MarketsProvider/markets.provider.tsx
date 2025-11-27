import {
  FC,
  createContext,
  useState,
  useContext,
  useCallback,
  useMemo,
  useEffect,
} from "react";

import { useQuery } from "@tanstack/react-query";
import estatesMocked from "app/mocks/rwas.json";
import fakeAssetsMocked from "app/mocks/assets.mock.json";

import {
  MarketContext,
  EstateType,
  MarketInternalStateType,
} from "./market.types";
import { withSortedFromMap } from "~/lib/utils";
import { createMarketPickers, createValidTokensRecord } from "./utils";
import { MARKETS_INITIAL_STATE } from "./market.const";
import { toTokenSlug } from "~/lib/assets";
import { ApiError } from "~/errors/error";
import { fetchAssets } from "~/lib/apis/mbrwa/assets";
import { transformAssetData } from "~/providers/MarketsProvider/utils/transformAssetData";

export const marketsContext = createContext<MarketContext>(undefined!);

// assets to show without actual API data
export const MarketsProvider: FC<PropsWithChildren> = ({ children }) => {
  const [marketsState, setMarketsState] = useState<MarketInternalStateType>(
    () => MARKETS_INITIAL_STATE
  );

  const [activeMarketState, setActiveMarketState] = useState<
    Pick<MarketContext, "activeMarket" | "isActiveMarketLoading">
  >(() => ({
    activeMarket: null,
    isActiveMarketLoading: true,
  }));

  const [marketApiError, setMarketApiError] = useState<ApiError | null>(null);

  const assetsData = useQuery({
    queryKey: ["fetchAssets"],
    queryFn: () => fetchAssets(),
  });

  useEffect(() => {
    if (!assetsData.data) return;
    const sortedMarketAddresses = assetsData.data.assets.map((item) =>
      toTokenSlug(item.asset.token_address, item.asset.token_id)
    );
    const orderbookConfig = new Map();
    assetsData.data.assets.forEach((item) => {
      orderbookConfig.set(item.orderbook.address, {
        address: item.orderbook.address,
        rwaTokenAddress: item.asset.token_address,
        currencies: item.orderbook.currencies?.map((currency) => ({
          token: currency.token,
        })) || [],
      });
    });

    const realAssetsFromApi = assetsData.data.assets.reduce<
      Map<string, EstateType>
    >((acc, item) => {
      const {
        asset: { token_address, token_id },
      } = item;
      const transformedAsset = transformAssetData(item);

      const slug = toTokenSlug(token_address, token_id);
      acc.set(slug, {
        ...transformedAsset,
        slug,
      });
      return acc;
    }, new Map());

    const fakeAssetsToShow = fakeAssetsMocked.reduce<Map<string, EstateType>>(
      (acc, asset) => {
        const slug = toTokenSlug(asset.token_address);
        if (slug) {
          // @ts-expect-error // fake data
          acc.set(slug, { ...asset, slug });
        }

        return acc;
      },
      new Map()
    );

    setMarketsState((prevState) => ({
      ...prevState,
      config: { orderbook: orderbookConfig },
      isLoading: false,
      sortedMarketAddresses,
      markets: new Map([...realAssetsFromApi, ...fakeAssetsToShow]),
    }));
  }, [JSON.stringify(assetsData.data)]);

  // retrieve base token addresses from Map
  const marketAddresses = useMemo(
    () =>
      Array.from(marketsState.config.orderbook.values()).map(
        (entry) => entry.rwaTokenAddress
      ),
    [marketsState.config.orderbook]
  );

  const orderbookAddresses = useMemo(
    () =>
      Array.from(marketsState.config.orderbook.values()).map(
        (entry) => entry.address
      ),
    [marketsState.config.orderbook]
  );

  const pickMarketByIdentifier = useCallback(
    (slug: string): EstateType | null => {
      return marketsState.markets.get(slug) ?? null;
    },
    [marketsState.markets]
  );

  const updateActiveMarketState = useCallback(
    (slug: string) => {
      const market = pickMarketByIdentifier(slug);
      setActiveMarketState({
        activeMarket: market,

        isActiveMarketLoading: false,
      });
    },
    [pickMarketByIdentifier]
  );

  // convert markets map to array (used in a lot of place, f,e, embla carousel)
  const marketsArr = useMemo(
    () =>
      withSortedFromMap(
        marketsState.markets,
        marketsState.sortedMarketAddresses
      ),
    [marketsState.markets, marketsState.sortedMarketAddresses]
  );

  const pickers = useMemo(
    () => createMarketPickers(marketsState.config),
    [marketsState.config]
  );

  const validBaseTokens = useMemo(
    () => createValidTokensRecord(marketsState.config.orderbook),
    [marketsState.config.orderbook]
  );

  const memoizedEstatesProviderValue: MarketContext = useMemo(
    () => ({
      ...marketsState,
      ...activeMarketState,
      marketsArr, // markets by base token
      pickMarketByIdentifier,
      updateActiveMarketState,
      marketAddresses, // dodo contract
      orderbookAddresses, // orderbook contract
      pickers,
      validBaseTokens,
      marketApiError,
      isLoading: marketApiError
        ? false
        : assetsData.isLoading ||
          assetsData.isFetching ||
          assetsData.isPending ||
          marketsState.isLoading,
    }),
    [
      marketsState,
      activeMarketState,
      marketsArr,
      pickMarketByIdentifier,
      updateActiveMarketState,
      marketAddresses,
      orderbookAddresses,
      pickers,
      validBaseTokens,
      marketApiError,
      assetsData.isLoading,
      assetsData.isFetching,
      assetsData.isPending,
    ]
  );

  return (
    <marketsContext.Provider value={memoizedEstatesProviderValue}>
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

// TODO update logic to use dynamic data
// for the sitemap
export const estateSlugs = estatesMocked.map(
  (estate) => estate.assetDetails.blockchain[0].identifier
);
