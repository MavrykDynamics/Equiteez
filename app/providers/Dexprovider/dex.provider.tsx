import {
  createContext,
  FC,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { DexProviderCtxType, DodoStorageType } from "./dex.provider.types";
import { useEstatesContext } from "../EstatesProvider/estates.provider";
import { useCurrencyContext } from "../CurrencyProvider/currency.provider";
import { useToasterContext } from "../ToasterProvider/toaster.provider";
import {
  getDodoMavTokenPairs,
  getDodoMavTokenPrices,
  getDodoMavTokenStorages,
} from "./utils/storage";
import { unknownToError } from "~/errors/error";
import BigNumber from "bignumber.js";
import { useAsyncWithRefetch } from "../ApolloProvider/hooks/useAsyncWithRefetch";

const dexContext = createContext<DexProviderCtxType>(undefined!);

type MarketProps = PropsWithChildren;

export const DexProvider: FC<MarketProps> = ({ children }) => {
  const { warning } = useToasterContext();
  const { estates, estateAddresses } = useEstatesContext();
  const { usdToTokenRates } = useCurrencyContext();
  const [dodoStorages, setDodoStorages] = useState<
    StringRecord<DodoStorageType>
  >({});
  const [dodoMavPrices, setDodomavPrices] = useState<StringRecord<BigNumber>>(
    {}
  );
  const [dodoTokenPair, setDodoTokenPair] = useState({});

  const fetchDexDataCallback = useCallback(async () => {
    try {
      const storages = await getDodoMavTokenStorages(estateAddresses);
      const dodoPrices = getDodoMavTokenPrices(Object.values(storages));
      const tokenPairs = getDodoMavTokenPairs(storages);

      setDodoStorages(storages);
      setDodomavPrices(dodoPrices);
      setDodoTokenPair(tokenPairs);
    } catch (e) {
      const err = unknownToError(e);
      warning("Prices", err.message);
    }
  }, [estateAddresses, warning]);

  useAsyncWithRefetch(fetchDexDataCallback, {
    refetchQueryVariables: estateAddresses,
  });

  const orderBookPrices = useMemo(
    () =>
      Object.keys(estates).reduce<StringRecord<string>>((acc, esKey) => {
        acc[esKey] = usdToTokenRates[esKey] ?? "0";

        return acc;
      }, {}),
    [estates, usdToTokenRates]
  );

  const memoizedDexCtx: DexProviderCtxType = useMemo(
    () => ({
      orderbook: orderBookPrices,
      dodoMav: dodoMavPrices,
      dodoStorages,
      dodoTokenPair,
    }),
    [orderBookPrices, dodoMavPrices, dodoStorages, dodoTokenPair]
  );

  return (
    <dexContext.Provider value={memoizedDexCtx}>{children}</dexContext.Provider>
  );
};

export const useDexContext = () => {
  const context = useContext(dexContext);

  if (!context) {
    throw new Error(
      `${useDexContext.name} must ne used within ${DexProvider.name}`
    );
  }

  return context;
};
