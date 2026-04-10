import { useEffect, useMemo, useRef, useState } from "react";
import type { OpenOrdersQueryData } from "./openOrders.schema";
import { createMockOpenOrders, updateMockOpenOrders } from "./openOrders.mock";

const DEMO_OPEN_ORDERS_INTERVAL = 2_000;
const DEFAULT_DEMO_REFERENCE_PRICE = 1;
const EMPTY_OPEN_ORDERS: OpenOrdersQueryData = {
  buyOrders: [],
  sellOrders: [],
};

type UseSimulatedOpenOrdersParams = {
  baseTokenDecimals: number;
  enabled?: boolean;
  quoteTokenDecimals: number;
  referencePrice?: number;
  rwaAddress?: string | null;
};

export function useSimulatedOpenOrders({
  baseTokenDecimals,
  enabled = true,
  quoteTokenDecimals,
  referencePrice = DEFAULT_DEMO_REFERENCE_PRICE,
  rwaAddress,
}: UseSimulatedOpenOrdersParams) {
  const [openOrders, setOpenOrders] =
    useState<OpenOrdersQueryData>(EMPTY_OPEN_ORDERS);
  const [loading, setLoading] = useState(false);
  const tickRef = useRef(0);

  const shouldRun = useMemo(
    () => Boolean(enabled && rwaAddress),
    [enabled, rwaAddress]
  );

  useEffect(() => {
    if (!shouldRun || !rwaAddress) {
      setOpenOrders(EMPTY_OPEN_ORDERS);
      setLoading(false);
      return;
    }

    setLoading(true);
    tickRef.current = 0;
    setOpenOrders(
      createMockOpenOrders({
        baseTokenDecimals,
        quoteTokenDecimals,
        referencePrice,
        rwaAddress,
        tick: tickRef.current++,
      })
    );
    setLoading(false);

    const intervalId = window.setInterval(() => {
      setOpenOrders((currentOpenOrders) =>
        updateMockOpenOrders({
          baseTokenDecimals,
          currentOrders: currentOpenOrders,
          quoteTokenDecimals,
          rwaAddress,
          tick: tickRef.current++,
        })
      );
    }, DEMO_OPEN_ORDERS_INTERVAL);

    return () => clearInterval(intervalId);
  }, [
    baseTokenDecimals,
    quoteTokenDecimals,
    referencePrice,
    rwaAddress,
    shouldRun,
  ]);

  return {
    openOrders,
    loading,
    isRefreshing: false,
  };
}
