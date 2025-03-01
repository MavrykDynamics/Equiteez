import {
  FC,
  createContext,
  useState,
  useContext,
  useCallback,
  useMemo,
} from "react";

import { useQuery } from "@apollo/client/index";

// mocked assets === markets
import estatesMocked from "app/mocks/rwas.json";

import {
  MarketContext,
  EstateType,
  MarketInternalStateType,
} from "./market.types";
import {
  DODO_MAV_ASSET_METADATA_QUERY,
  MARKETS_ADDRESSES_QUERY,
} from "./queries/marketTokens.query";
import { marketTokenNormalizer } from "./utils/marketTokenNormalizer";
import {
  getUpdatedDodoMavMarketsConfig,
  getUpdatedOrderbookMarketsConfig,
} from "./utils/markets.utils";
import { marketsConfigQuerySchema } from "./market.schemas";
import { mapValuesToArray } from "~/lib/utils";
import { createMarketPickers, createValidTokensRecord } from "./utils";
import { MARKETS_INITIAL_STATE } from "./market.const";

export const marketsContext = createContext<MarketContext>(undefined!);

export const MarketsProvider: FC<PropsWithChildren> = ({ children }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [marketsState, setMarketsState] = useState<MarketInternalStateType>(
    () => MARKETS_INITIAL_STATE
  );

  const [activeMarketState, setActiveMarketState] = useState<
    Pick<MarketContext, "activeMarket" | "isActiveMarketLoading">
  >(() => ({
    activeMarket: null,
    isActiveMarketLoading: true,
  }));

  const { loading: isMarketsAddressesLoading } = useQuery(
    MARKETS_ADDRESSES_QUERY,
    {
      onCompleted: (data) => {
        try {
          const parsedConfigData = marketsConfigQuerySchema.parse(data);
          const { dodo_mav, orderbook } = parsedConfigData;

          const dodoConfig = getUpdatedDodoMavMarketsConfig(
            marketsState.config.dodoMav,
            dodo_mav
          );
          const orderbookConfig = getUpdatedOrderbookMarketsConfig(
            marketsState.config.orderbook,
            orderbook
          );

          setMarketsState((prev) => ({
            ...prev,
            config: { dodoMav: dodoConfig, orderbook: orderbookConfig },
          }));
        } catch (e) {
          console.log(e, "MARKETS_ADDRESSES_QUERY from catch");
        }
      },
      onError: (error) => console.log(error, "MARKET_TOKENS_QUERY"),
    }
  );

  // retrieve base token addresses from Map
  const dodoBaseTokenAddresses = useMemo(
    () =>
      Array.from(marketsState.config.dodoMav.values()).map(
        (entry) => entry.address
      ),
    [marketsState.config.dodoMav]
  );

  const { loading } = useQuery(DODO_MAV_ASSET_METADATA_QUERY, {
    // query meta by base tokens from dodo_mav
    variables: { addresses: dodoBaseTokenAddresses },
    skip: marketsState.config.dodoMav.size === 0,
    onCompleted: (data) => {
      try {
        // TODO add zod parser after API fixes
        // right now it doesnt make sense to add schema for this data
        // so we use mocked data to dill missing data which can vary based on token address
        // @ts-expect-error // using mocked data from json
        const parsedMarkets = marketTokenNormalizer(data.token, estatesMocked);

        // TODO delete fake data reducer after api fixes
        // const fakeAssets = mockedAssets.reduce<StringRecord<EstateType>>(
        //   (acc, asset) => {
        //     const slug = toTokenSlug(asset.token_address);
        //     acc[slug] = { ...asset, slug };
        //     return acc;
        //   },
        //   {}
        // );

        setMarketsState((prev) => ({
          ...prev,
          markets: parsedMarkets,
          // estates: { ...parsedMarkets, ...fakeAssets },
          areLoading: false,
        }));
      } catch (e) {
        console.log(e, "MARKET_TOKENS__DATA_QUERY from catch");
      }
    },
    onError: (error) => console.log(error, "MARKET_TOKENS__DATA_QUERY"),
  });

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
    () => mapValuesToArray(marketsState.markets),
    [marketsState.markets]
  );

  const pickers = useMemo(
    () => createMarketPickers(marketsState.config),
    [marketsState.config]
  );

  const validBaseTokens = useMemo(
    () => createValidTokensRecord(marketsState.config.dodoMav),
    [marketsState.config.dodoMav]
  );

  const memoizedEstatesProviderValue: MarketContext = useMemo(
    () => ({
      ...marketsState,
      ...activeMarketState,
      marketsArr,
      pickMarketByIdentifier,
      updateActiveMarketState,
      marketAddresses: dodoBaseTokenAddresses,
      pickers,
      validBaseTokens,
      isLoading: loading || isMarketsAddressesLoading || marketsState.isLoading,
    }),
    [
      marketsState,
      activeMarketState,
      marketsArr,
      pickMarketByIdentifier,
      updateActiveMarketState,
      dodoBaseTokenAddresses,
      loading,
      pickers,
      validBaseTokens,
      isMarketsAddressesLoading,
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
