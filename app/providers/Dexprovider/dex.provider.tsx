import { createContext, FC, useContext, useMemo } from "react";
import { DexProviderCtxType } from "./dex.provider.types";
import { useQuery } from "@apollo/client/index";
import { DEXES_QUERY } from "./queries/dexes.query";

const dexContext = createContext<DexProviderCtxType>(undefined!);

type MarketProps = PropsWithChildren;

export const DexProvider: FC<MarketProps> = ({ children }) => {
  const memoizedDexCtx: DexProviderCtxType = useMemo(() => ({}), []);

  const { loading: initialConfigLoading } = useQuery(DEXES_QUERY, {
    onCompleted: (data) => {
      try {
        console.log(data), "---------__----------";

        // TODO add normlizer
        // normalize data and store in this context
      } catch (e) {
        console.log(e, "DEXES_ERROR from catch");
      }
    },
    onError: (error) => console.log(error, "TEST_QUIERY_ERROR"),
  });

  // initialixe dexs based on markets from props inside market ctx
  // loading indicator

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
