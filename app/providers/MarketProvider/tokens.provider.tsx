import { createContext, FC, useContext, useMemo } from "react";
import { MarketProviderCtxType } from "./market.provider.types";
import { MARKET_TOKENS_QUERY } from "./queries/marketTokens.query";
import { useQuery } from "@apollo/client";

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

  const { loading: initialConfigLoading } = useQuery(MARKET_TOKENS_QUERY, {
    onCompleted: (data) => {
      try {
        console.log(data);
      } catch (e) {
        console.log(e, "TEST_QUIERY_ERROR from catch");
      }
    },
    onError: (error) => console.log(error, "TEST_QUIERY_ERROR"),
  });

  if (!context) {
    throw new Error(
      `${useMarketProvider.name} must ne used within ${MarketProvider.name}`
    );
  }

  return context;
};
