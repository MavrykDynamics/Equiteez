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
  PrimaryEstate,
  SECONDARY_MARKET,
  SecondaryEstate,
} from "./estates.types";
import {
  MARKET_TOKENS__DATA_QUERY,
  MARKET_TOKENS_QUERY,
} from "./queries/marketTokens.query";
import {
  getMarketAddresses,
  marketTokenNormalizer,
} from "./utils/marketTokenNormalizer";
import { toTokenSlug } from "~/lib/assets";

export const estatesContext = createContext<EstatesContext>(undefined!);

export const EstatesProvider: FC<PropsWithChildren> = ({ children }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [estatesState, setEstatesState] = useState<
    Pick<EstatesContext, "estates" | "estateAddresses">
  >(() => ({
    estateAddresses: [],
    estates: {},
    areLoading: true,
  }));

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

  const { loading: isMarketsAddressesLoading } = useQuery(MARKET_TOKENS_QUERY, {
    onCompleted: (data) => {
      try {
        const parsedAddresses = getMarketAddresses(data);

        setEstatesState((prev) => ({
          ...prev,
          estateAddresses: parsedAddresses,
        }));
      } catch (e) {
        console.log(e, "MARKET_TOKENS_QUERY_ERROR from catch");
      }
    },
    onError: (error) => console.log(error, "MARKET_TOKENS_QUERY"),
  });

  const { loading } = useQuery(MARKET_TOKENS__DATA_QUERY, {
    variables: { addresses: estatesState.estateAddresses },
    skip: estatesState.estateAddresses.length === 0,
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

        setEstatesState((prev) => ({
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
        Object.values(estatesState.estates).find(
          (es) => es.assetDetails.blockchain[0].identifier === address
        ) ?? null
      );
    },
    [estatesState.estates]
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
      ...estatesState,
      ...activeEstateData,
      estatesArr: Object.values(estatesState.estates),
      pickEstateByIdentifier,
      setActiveEstate,
      isLoading:
        loading || isMarketsAddressesLoading || estatesState.areLoading,
    }),
    [
      estatesState,
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
