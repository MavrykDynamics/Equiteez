import { createContext, FC, useContext, useMemo } from "react";
import { DexProviderCtxType } from "./dex.provider.types";

const dexContext = createContext<DexProviderCtxType>(undefined!);

type MarketProps = PropsWithChildren;

export const DexProvider: FC<MarketProps> = ({ children }) => {
  const memoizedDexCtx: DexProviderCtxType = useMemo(() => ({}), []);

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
