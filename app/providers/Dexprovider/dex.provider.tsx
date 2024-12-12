import {
  createContext,
  FC,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { DexProviderCtxType } from "./dex.provider.types";
import { useEstatesContext } from "../EstatesProvider/estates.provider";
import { useCurrencyContext } from "../CurrencyProvider/currency.provider";
import { useToasterContext } from "../ToasterProvider/toaster.provider";
import { getDodoMavTokenPrices } from "./utils/storage";
import { unknownToError } from "~/errors/error";

const dexContext = createContext<DexProviderCtxType>(undefined!);

type MarketProps = PropsWithChildren;

export const DexProvider: FC<MarketProps> = ({ children }) => {
  const { warning } = useToasterContext();
  const { estates, estateAddresses } = useEstatesContext();
  const { usdToTokenRates } = useCurrencyContext();
  const [dodoMavPrices, setDodomavPrices] = useState<StringRecord<string>>({});

  // TODO switch to gql query
  useEffect(() => {
    (async function () {
      try {
        const dodoPrices = await getDodoMavTokenPrices(estateAddresses);
        setDodomavPrices(dodoPrices);

        // setDodomavPrices
      } catch (e) {
        const err = unknownToError(e);
        warning("Prices", err.message);
      }
    })();
  }, [warning, estateAddresses]);

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
    }),
    [orderBookPrices, dodoMavPrices]
  );

  console.log(memoizedDexCtx, "memoizedDexCtx");

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
