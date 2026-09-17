import {
  createContext,
  FC,
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

  const [orderbookTickSizes, setOrderbookTickSizes] =
    useState<OrderbookTickSizesByAddress>({});
  const [hasOrderbookTickSizeLoadError, setHasOrderbookTickSizeLoadError] =
    useState(false);

  const orderbookTokenPair = useMemo(
    () => getOrderbookTokenPairs(config.orderbook),
    [config.orderbook]
  );

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

  const fallbackOrderbookConfig = useMemo(() => {
    if (!orderbookData) return new Map<string, OrderbookConfigType>();

    return orderbookData.reduce<Map<string, OrderbookConfigType>>(
      (acc, item) => {
        if (resolveOrderbookTickSize(item, {}) !== undefined) return acc;

        const storageConfig = config.orderbook.get(item.address);

        if (storageConfig) acc.set(item.address, storageConfig);

        return acc;
      },
      new Map()
    );
  }, [config.orderbook, orderbookData]);

  useEffect(() => {
    if (!fallbackOrderbookConfig.size) {
      setOrderbookTickSizes({});
      setHasOrderbookTickSizeLoadError(false);
      return;
    }

    let cancelled = false;

    setHasOrderbookTickSizeLoadError(false);

    getOrderbookTickSizes(fallbackOrderbookConfig)
      .then((tickSizes) => {
        if (!cancelled) setOrderbookTickSizes(tickSizes);
      })
      .catch((error) => {
        if (cancelled) return;

        setOrderbookTickSizes({});
        setHasOrderbookTickSizeLoadError(true);
        const err = unknownToError(error);
        warning("Error on get orderbook tick sizes", err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [fallbackOrderbookConfig, warning]);

  const hasUnresolvedFallbackTickSizes = useMemo(
    () =>
      Array.from(fallbackOrderbookConfig.keys()).some(
        (address) => !orderbookTickSizes[address]
      ),
    [fallbackOrderbookConfig, orderbookTickSizes]
  );

  const isLoading = useMemo(() => {
    if (!config.orderbook.size || error) return false;
    if (!orderbookData) return true;

    return hasUnresolvedFallbackTickSizes && !hasOrderbookTickSizeLoadError;
  }, [
    config.orderbook.size,
    error,
    hasOrderbookTickSizeLoadError,
    hasUnresolvedFallbackTickSizes,
    orderbookData,
  ]);

  const orderbookStorages = useMemo<StringRecord<OrderBookPriceData>>(() => {
    const storages = orderbookData
      ? getOrderbookStorages(
          orderbookData,
          config.orderbook,
          orderbookTickSizes
        )
      : {};

    return new Proxy<StringRecord<OrderBookPriceData>>(
      { ...storages },
      priceProxyHandler
    );
  }, [config.orderbook, orderbookData, orderbookTickSizes]);

  const memoizedDexCtx: DexProviderCtxType = useMemo(
    () => ({
      isLoading,
      orderbookStorages,
      orderbookTokenPair,
    }),
    [isLoading, orderbookTokenPair, orderbookStorages]
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
