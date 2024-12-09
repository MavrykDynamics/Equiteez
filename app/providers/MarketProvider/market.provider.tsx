import { createContext, FC, useContext, useMemo, useState } from "react";
import { MarketProviderCtxType } from "./market.provider.types";
import { MARKET_TOKENS_QUERY } from "./queries/marketTokens.query";
import { useQuery } from "@apollo/client/index";
import { marketTokenNormalizer } from "./utils/marketTokenNormalizer";
import { useEstatesContext } from "../EstatesProvider/estates.provider";
import { EstateType } from "../EstatesProvider/estates.types";

const marketProvider = createContext<MarketProviderCtxType>(undefined!);

type MarketProps = PropsWithChildren;

export const MarketProvider: FC<MarketProps> = ({ children }) => {
  const [markets, setMarkets] = useState<EstateType[]>([]);
  // TODO remove later when api will return all data
  const { estates } = useEstatesContext();

  const memoizedMarketCtx: MarketProviderCtxType = useMemo(
    () => ({ markets: markets }),
    [markets]
  );

  const { loading: initialConfigLoading } = useQuery(MARKET_TOKENS_QUERY, {
    onCompleted: (data) => {
      try {
        const parsedMarkets = marketTokenNormalizer(data.token, estates);
        setMarkets(parsedMarkets);
      } catch (e) {
        console.log(e, "MARKET_TOKENS_QUERY_ERROR from catch");
      }
    },
    onError: (error) => console.log(error, "MARKET_TOKENS_QUERY"),
  });

  return (
    <marketProvider.Provider value={memoizedMarketCtx}>
      {children}
    </marketProvider.Provider>
  );
};

export const useMarketProvider = () => {
  const context = useContext(marketProvider);

  if (!context) {
    throw new Error(
      `${useMarketProvider.name} must ne used within ${MarketProvider.name}`
    );
  }

  return context;
};
