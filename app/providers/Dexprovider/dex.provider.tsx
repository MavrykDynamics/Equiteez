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
import { getOrderbookTickSizes } from "./utils/orderbookConfig";
import type { OrderbookTickSizesByAddress } from "./utils/orderbookConfig";
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
        tickSize: 0,
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
  const [orderbookTickSizes, setOrderbookTickSizes] =
    useState<OrderbookTickSizesByAddress>({});

  const orderbookTokenPair = useMemo(
    () => getOrderbookTokenPairs(config.orderbook),
    [config.orderbook]
  );

  const handleOrderbookData = useCallback((data: OrderbooksList) => {
    const hasTickSizes = Array.from(config.orderbook.values()).every(
      ({ address }) => orderbookTickSizes[address]
    );

    if (!hasTickSizes) return;

    const orderbookStorages = getOrderbookStorages(
      data,
      config.orderbook,
      orderbookTickSizes
    );

    setOrderbookStorages(
      new Proxy({ ...orderbookStorages }, priceProxyHandler)
    );
  }, [config.orderbook, orderbookTickSizes]);

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
  }, [error, warning]);

  useEffect(() => {
    if (!config.orderbook.size) {
      setOrderbookTickSizes({});
      return;
    }

    let cancelled = false;

    getOrderbookTickSizes(config.orderbook)
      .then((tickSizes) => {
        if (!cancelled) setOrderbookTickSizes(tickSizes);
      })
      .catch((error) => {
        if (cancelled) return;

        setOrderbookTickSizes({});
        const err = unknownToError(error);
        warning("Error on get orderbook tick sizes", err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [config.orderbook, warning]);

  useEffect(() => {
    if (!orderbookData) return;

    handleOrderbookData(orderbookData);
  }, [handleOrderbookData, orderbookData]);

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
