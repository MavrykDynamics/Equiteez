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
import fakeAssetsMocked from "app/mocks/assets.mock.json";

import {
  MarketContext,
  EstateType,
  MarketInternalStateType,
} from "./market.types";
import {
  DODO_MAV_ASSET_METADATA_QUERY,
  MARKETS_ADDRESSES_QUERY,
} from "./queries/marketTokens.query";
// import { marketTokenNormalizer } from "./utils/marketTokenNormalizer";
import {
  getUpdatedDodoMavMarketsConfig,
  getUpdatedOrderbookMarketsConfig,
} from "./utils/markets.utils";
import { marketsConfigQuerySchema } from "./market.schemas";
import { mapValuesToArray } from "~/lib/utils";
import { createMarketPickers, createValidTokensRecord } from "./utils";
import {
  MARKETS_INITIAL_STATE,
  // MARKETS_PAGINATION_LIMIT,
} from "./market.const";
import { toTokenSlug } from "~/lib/assets";
import { useApolloContext } from "../ApolloProvider/apollo.provider";
import { useToasterContext } from "../ToasterProvider/toaster.provider";
import { ApiError, unknownToError } from "~/errors/error";

export const marketsContext = createContext<MarketContext>(undefined!);

// assets to show without actual API data

export const MarketsProvider: FC<PropsWithChildren> = ({ children }) => {
  const { handleApolloError } = useApolloContext();
  const { bug } = useToasterContext();
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

  // const [marketsPagination, setMarketsPagination] = useState(() => ({
  //   limit: MARKETS_PAGINATION_LIMIT,
  //   offset: 0,
  // }));

  const [marketApiError, setMarketApiError] = useState<ApiError | null>(null);

  const { loading: isMarketsAddressesLoading } = useQuery(
    MARKETS_ADDRESSES_QUERY,
    {
      // variables: { ...marketsPagination },
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
            config: {
              ...prev.config,
              dodoMav: dodoConfig,
              orderbook: orderbookConfig,
            },
          }));
        } catch (e) {
          const error = unknownToError(e);
          setMarketApiError(new ApiError(error));
          bug(new ApiError("MARKETS_ADDRESSES_QUERY"));
        }
      },
      onError: (error) => {
        setMarketApiError(new ApiError(error));
        handleApolloError(error, "MARKETS_ADDRESSES_QUERY");
      },
    }
  );

  // retrieve base token addresses from Map
  const dodoBaseTokenAddresses = useMemo(
    () =>
      Array.from(marketsState.config.dodoMav.values()).map(
        (entry) => entry.baseTokenAddress
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
        const realAssetsFromApi = data.token.reduce<Map<string, EstateType>>(
          (acc, asset) => {
            const { token_metadata } = asset;
            const {
              decimals = 6,
              icon = "",
              symbol = "-",
            } = token_metadata ?? {};

            const slug = toTokenSlug(asset.address, asset.token_id);
            const assetMocked = estatesMocked.find(
              (item) => item.token_address === asset.address
            );
            if (assetMocked) {
              // const [previewImg] = buildTokenImagesStack(thumbnailUri);
              // @ts-expect-error // fake data
              acc.set(slug, {
                ...assetMocked,
                slug,
                token_address: asset.address,
                decimals,
                icon,
                symbol,
                // name,
                // assetDetails: {
                //   ...assetMocked.assetDetails,
                //   previewImage: previewImg,
                // },
              });
            }

            return acc;
          },
          new Map()
        );

        const fakeAssetsToShow = fakeAssetsMocked.reduce<
          Map<string, EstateType>
        >((acc, asset) => {
          const slug = toTokenSlug(asset.token_address);
          if (slug) {
            // @ts-expect-error // fake data
            acc.set(slug, { ...asset, slug });
          }

          return acc;
        }, new Map());

        setMarketsState((prev) => ({
          ...prev,
          markets: new Map([
            ...marketsState.markets,
            ...realAssetsFromApi,
            ...fakeAssetsToShow,
          ]),
          isLoading: false,
        }));
      } catch (e) {
        const error = unknownToError(e);
        setMarketApiError(new ApiError(error));
        bug(new ApiError("MARKET_TOKENS__DATA_QUERY"));
      }
    },
    onError: (error) => {
      setMarketApiError(new ApiError(error));
      handleApolloError(error, "MARKET_TOKENS__DATA_QUERY");
    },
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

  // const loadMoreMarkets = useCallback(() => {
  //   setMarketsPagination((prev) => ({
  //     limit: prev.limit + MARKETS_PAGINATION_LIMIT,
  //     offset: prev.offset + MARKETS_PAGINATION_LIMIT,
  //   }));
  // }, []);

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
      marketApiError,
      isLoading: marketApiError
        ? false
        : loading || isMarketsAddressesLoading || marketsState.isLoading,
    }),
    [
      marketsState,
      activeMarketState,
      marketsArr,
      pickMarketByIdentifier,
      updateActiveMarketState,
      dodoBaseTokenAddresses,
      pickers,
      validBaseTokens,
      marketApiError,
      loading,
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
