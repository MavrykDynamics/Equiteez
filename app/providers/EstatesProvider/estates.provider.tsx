import {
  FC,
  createContext,
  useState,
  useContext,
  useCallback,
  useMemo,
} from "react";

import { useQuery } from "@apollo/client/index";

// mocked assets
import mockedAssets from "app/mocks/assets.mock.json";
import estatesMocked from "app/mocks/rwas.json";

import {
  EstatesContext,
  EstateType,
  MarketInternalStateType,
  PrimaryEstate,
  SECONDARY_MARKET,
  SecondaryEstate,
} from "./estates.types";
import {
  MARKET_TOKENS__DATA_QUERY,
  MARKETS_ADDRESSES_QUERY,
} from "./queries/marketTokens.query";
import {
  getMarketAddresses,
  marketTokenNormalizer,
} from "./utils/marketTokenNormalizer";
import { toTokenSlug } from "~/lib/assets";
import {
  getUpdatedDodoMavMarketsConfig,
  getUpdatedOrderbookMarketsConfig,
} from "./utils/markets.utils";
import { marketsConfigQuerySchema } from "./market.schemas";

export const estatesContext = createContext<EstatesContext>(undefined!);

// TODO rename to MarketsProvider
export const EstatesProvider: FC<PropsWithChildren> = ({ children }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [marketsState, setMarketsState] = useState<MarketInternalStateType>(
    () => ({
      config: {
        dodoMav: new Map(), // dodoContract -> {adddress, baseToken, quoteToken, quoteLpToken, baseLpToken}
        orderbook: new Map(),
      },
      markets: new Map(),
      isLoading: true,
    })
  );

  const [activeEstateData, setActiveEstateData] = useState<
    Pick<
      EstatesContext,
      "activeEstate" | "isActiveEstateLoading" | "isActiveEstateSecondaryMarket"
    >
  >(() => ({
    activeEstate: null,
    isActiveEstateLoading: true,
    isActiveEstateSecondaryMarket: false,
  }));

  const { loading: isMarketsAddressesLoading } = useQuery(
    MARKETS_ADDRESSES_QUERY,
    {
      onCompleted: (data) => {
        try {
          const parsedConfigData = marketsConfigQuerySchema.parse(data.data);
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

  const { loading } = useQuery(MARKET_TOKENS__DATA_QUERY, {
    variables: { addresses: marketsState.estateAddresses },
    skip: marketsState.estateAddresses.length === 0,
    onCompleted: (data) => {
      try {
        const parsedMarkets = marketTokenNormalizer(data.token, estatesMocked);

        // TODO delete fake data fter api fixes
        const fakeAssets = mockedAssets.reduce<StringRecord<EstateType>>(
          (acc, asset) => {
            const slug = toTokenSlug(asset.token_address);
            acc[slug] = { ...asset, slug };
            return acc;
          },
          {}
        );

        setMarketsState((prev) => ({
          ...prev,
          estates: { ...parsedMarkets, ...fakeAssets },
          areLoading: false,
        }));
      } catch (e) {
        console.log(e, "MARKET_TOKENS__DATA_QUERY from catch");
      }
    },
    onError: (error) => console.log(error, "MARKET_TOKENS__DATA_QUERY"),
  });

  const pickEstateByIdentifier = useCallback(
    (address: string): PrimaryEstate | SecondaryEstate | null => {
      return (
        Object.values(marketsState.estates).find(
          (es) => es.assetDetails.blockchain[0].identifier === address
        ) ?? null
      );
    },
    [marketsState.estates]
  );

  const setActiveEstate = useCallback(
    (address: string) => {
      const estate = pickEstateByIdentifier(address);
      setActiveEstateData({
        activeEstate: estate,
        isActiveEstateSecondaryMarket:
          estate?.assetDetails.type === SECONDARY_MARKET,
        isActiveEstateLoading: false,
      });
    },
    [pickEstateByIdentifier]
  );

  const memoizedEstatesProviderValue: EstatesContext = useMemo(
    // TODO update "areloading" logic for markets
    () => ({
      ...marketsState,
      ...activeEstateData,
      estatesArr: Object.values(marketsState.estates),
      pickEstateByIdentifier,
      setActiveEstate,
      isLoading:
        loading || isMarketsAddressesLoading || marketsState.areLoading,
    }),
    [
      marketsState,
      activeEstateData,
      pickEstateByIdentifier,
      setActiveEstate,
      loading,
      isMarketsAddressesLoading,
    ]
  );

  return (
    <estatesContext.Provider value={memoizedEstatesProviderValue}>
      {children}
    </estatesContext.Provider>
  );
};

export const useEstatesContext = () => {
  const context = useContext(estatesContext);

  if (!context) {
    throw new Error("estatesContext should be used within EstatesProvider");
  }

  return context;
};

// for the sitemap
export const estateSlugs = estatesMocked.map(
  (estate) => estate.assetDetails.blockchain[0].identifier
);
