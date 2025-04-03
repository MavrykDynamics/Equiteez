import { createContext, FC, useContext, useMemo, useState } from "react";
import { DexProviderCtxType, DodoStorageType } from "./dex.provider.types";
import { useMarketsContext } from "../MarketsProvider/markets.provider";
import { useCurrencyContext } from "../CurrencyProvider/currency.provider";
import { useToasterContext } from "../ToasterProvider/toaster.provider";
import {
  getDodoMavTokenPairs,
  getDodoMavTokenPrices,
  getDodoMavTokenStorages,
} from "./utils/storage";
import { unknownToError } from "~/errors/error";
import BigNumber from "bignumber.js";
import { useQueryWithRefetch } from "../ApolloProvider/hooks/useQueryWithRefetch";
import { DEX_STORAGE_QUERY } from "./queries/storage.query";

const dexContext = createContext<DexProviderCtxType>(undefined!);

type MarketProps = PropsWithChildren;

const priceProxyHandler: ProxyHandler<StringRecord<BigNumber>> = {
  get(target, prop: string) {
    // used to return price as 0 if not found
    return target[prop] ?? new BigNumber(0);
  },
};

export const DexProvider: FC<MarketProps> = ({ children }) => {
  const { warning } = useToasterContext();
  const { markets, marketAddresses } = useMarketsContext();
  const { usdToTokenRates } = useCurrencyContext();
  const [dodoStorages, setDodoStorages] = useState<
    StringRecord<DodoStorageType>
  >({});
  const [dodoMavPrices, setDodoMavPrices] = useState(
    () => new Proxy({}, priceProxyHandler)
  );
  const [dodoTokenPair, setDodoTokenPair] = useState({});

  useQueryWithRefetch(
    DEX_STORAGE_QUERY,
    {
      // variables: { addresses: marketAddresses },
      skip: marketAddresses.length === 0 || markets.size === 0,
      onCompleted: (data) => {
        try {
          const storages = getDodoMavTokenStorages(data);

          const dodoPrices = getDodoMavTokenPrices(
            Object.values(storages),
            markets
          );

          const tokenPairs = getDodoMavTokenPairs(storages);

          setDodoStorages(storages);
          setDodoTokenPair(tokenPairs);

          // update proxy prices
          Object.entries(dodoPrices).forEach(([key, value]) => {
            dodoMavPrices[key] = value;
          });

          setDodoMavPrices(new Proxy({ ...dodoPrices }, priceProxyHandler));
        } catch (e) {
          console.log(e, "DEX_STORAGE_QUERY from catch");
          const err = unknownToError(e);
          warning("Prices", err.message);
        }
      },
      onError: (error) => console.log(error, "DEX_STORAGE_QUERY"),
    },
    { blocksDiff: 5 }
  );

  const orderBookPrices = useMemo(
    () =>
      Array.from(markets.keys()).reduce<StringRecord<string>>((acc, esKey) => {
        acc[esKey] = usdToTokenRates[esKey] ?? "0";
        return acc;
      }, {}),
    [markets, usdToTokenRates]
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
