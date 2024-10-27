import { createContext, FC, useContext, useMemo } from "react";
import { MarketProviderCtxType } from "./market.provider.types";

const marketProvider = createContext<MarketProviderCtxType>(undefined!);

type MarketProps = PropsWithChildren;

export const MarketProvider: FC<MarketProps> = ({ children }) => {
  const memoizedMarketCtx: MarketProviderCtxType = useMemo(() => ({}), []);

  return (
    <marketProvider.Provider value={memoizedMarketCtx}>
      {children}
    </marketProvider.Provider>
  );
};

export const useMarketProvider = () => {
  const context = useContext(marketProvider);

  // useQuery or fetch from server marketsData
  // initialixe it
  // loading indicator

  if (!context) {
    throw new Error(
      `${useMarketProvider.name} must ne used within ${MarketProvider.name}`
    );
  }

  return context;
};
