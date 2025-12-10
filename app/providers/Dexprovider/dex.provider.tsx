import {
  createContext,
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { DexProviderCtxType } from "./dex.provider.types";
import { useMarketsContext } from "../MarketsProvider/markets.provider";
import { useToasterContext } from "../ToasterProvider/toaster.provider";
import {
  getOrderbookTokenPairs,
  OrderBookPriceData,
  getOrderbookStorages,
} from "./utils/storage";
import { unknownToError } from "~/errors/error";
import { useApiQuery } from "~/hooks/useApiQuery";
import { fetchOrderbooks } from "~/lib/apis/mbrwa/orderbooks";
import { OrderbooksList } from "~/providers/Dexprovider/schemas/orderbook.schema";

const dexContext = createContext<DexProviderCtxType>(undefined!);

type MarketProps = PropsWithChildren;

const priceProxyHandler: ProxyHandler<StringRecord<OrderBookPriceData>> = {
  get(target, prop: string) {
    // used to return price as 0 if not found
    return (
      target[prop] ?? {
        lowestSellPrice: 0,
        highestBuyPrice: 0,
        buyOrderFee: 0,
        sellOrderFee: 0,
        rwaTokenAddress: prop,
      }
    );
  },
};

export const DexProvider: FC<MarketProps> = ({ children }) => {
  const { warning } = useToasterContext();
  const { config } = useMarketsContext();

  // Contains price info as well
  const [orderbookStorages, setOrderbookStorages] = useState(
    () => new Proxy({}, priceProxyHandler)
  );

  // Token pairs
  const [orderbookTokenPair, setOrderbookTokenPair] = useState({});

  // We do not update query for storages cuz we have this data from the markets query
  useEffect(() => {
    const orderBookPairs = getOrderbookTokenPairs(
      new Map().set("KT1CgLvrzj5MziwPWWzPkZj1eDeEpRAsYvQ2", {
        address: "KT1RZB8ZK4PtWPD8pV5hj4DJeke4am3A4gz2",
        rwaTokenAddress: "KT1CgLvrzj5MziwPWWzPkZj1eDeEpRAsYvQ2",
        currencies: [
          {
            token: {
              address: "KT1D7ZQBhwxkMgZThqctYtMXigFvJRZL4eSy",
              token_id: 0,
            },
          },
        ],
      })
    );
    setOrderbookTokenPair(orderBookPairs);
  }, [config]);

  const handleOrderbookData = useCallback((data: OrderbooksList) => {
    const orderbookStorages = getOrderbookStorages(data);

    setOrderbookStorages(
      new Proxy({ ...orderbookStorages }, priceProxyHandler)
    );
  }, []);

  const { data: orderbookData, error } = useApiQuery({
    fetchFn: fetchOrderbooks,
    deps: [],
  });

  useEffect(() => {
    if (error) {
      console.log(error, "handleOrderbookData from catch");
      const err = unknownToError(error);
      warning("Error on get orderbook data", err.message);
    }
  }, [error]);

  useEffect(() => {
    if (!orderbookData) return;

    handleOrderbookData(orderbookData);
  }, [JSON.stringify(orderbookData)]);

  const memoizedDexCtx: DexProviderCtxType = useMemo(
    () => ({
      orderbookStorages,
      orderbookTokenPair,
    }),
    [orderbookTokenPair, orderbookStorages]
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
