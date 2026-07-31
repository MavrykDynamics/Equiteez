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
  resolveOrderbookTickSize,
} from "./utils/storage";
import { getOrderbookTickSizes } from "./utils/orderbookConfig";
import type { OrderbookTickSizesByAddress } from "./utils/orderbookConfig";
import { unknownToError } from "~/errors/error";
import { useApiQuery } from "~/hooks/useApiQuery";
import { fetchOrderbooks } from "~/lib/apis/mbrwa/orderbooks";
import { OrderbooksList } from "~/providers/Dexprovider/schemas/orderbook.schema";
import type { OrderbookConfigType } from "~/providers/MarketsProvider/market.types";

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
        orderbookAddress: "",
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
  const [isOrderbookTickSizesLoading, setIsOrderbookTickSizesLoading] =
    useState(false);

  const orderbookTokenPair = useMemo(
    () => getOrderbookTokenPairs(config.orderbook),
    [config.orderbook]
  );

  const handleOrderbookData = useCallback((data: OrderbooksList) => {
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
    if (!config.orderbook.size || !orderbookData) {
      setOrderbookTickSizes({});
      setIsOrderbookTickSizesLoading(false);
      return;
    }

    const fallbackOrderbookConfig = orderbookData.reduce<
      Map<string, OrderbookConfigType>
    >((acc, item) => {
      if (resolveOrderbookTickSize(item, {}) !== undefined) return acc;

      const storageConfig = config.orderbook.get(item.address);

      if (storageConfig) acc.set(item.address, storageConfig);

      return acc;
    }, new Map());

    if (!fallbackOrderbookConfig.size) {
      setOrderbookTickSizes({});
      setIsOrderbookTickSizesLoading(false);
      return;
    }

    let cancelled = false;

    setIsOrderbookTickSizesLoading(true);

    getOrderbookTickSizes(fallbackOrderbookConfig)
      .then((tickSizes) => {
        if (!cancelled) setOrderbookTickSizes(tickSizes);
      })
      .catch((error) => {
        if (cancelled) return;

        setOrderbookTickSizes({});
        const err = unknownToError(error);
        warning("Error on get orderbook tick sizes", err.message);
      })
      .finally(() => {
        if (!cancelled) setIsOrderbookTickSizesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [config.orderbook, orderbookData, warning]);

  useEffect(() => {
    if (!orderbookData) return;

    handleOrderbookData(orderbookData);
  }, [handleOrderbookData, orderbookData]);

  const isOrderbookStoragesLoading = useMemo(() => {
    if (!config.orderbook.size || error) return false;
    if (!orderbookData) return true;
    if (!isOrderbookTickSizesLoading) return false;

    return orderbookData.some(
      (item) => resolveOrderbookTickSize(item, orderbookTickSizes) === undefined
    );
  }, [
    config.orderbook.size,
    error,
    isOrderbookTickSizesLoading,
    orderbookData,
    orderbookTickSizes,
  ]);

  const memoizedDexCtx: DexProviderCtxType = useMemo(
    () => ({
      isOrderbookStoragesLoading,
      orderbookStorages,
      orderbookTokenPair,
    }),
    [isOrderbookStoragesLoading, orderbookTokenPair, orderbookStorages]
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
