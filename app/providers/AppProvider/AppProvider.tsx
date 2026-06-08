import {
  createContext,
  FC,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type AppContext = {
  IS_WEB: boolean;
};

export const context = createContext<AppContext>(undefined!);

type AppProviderProps = PropsWithChildren;

export const AppProvider: FC<AppProviderProps> = ({ children }) => {
  const [isWeb, setIsWeb] = useState(false);

  useEffect(() => {
    setIsWeb(typeof window !== "undefined");
  }, []);

  const memoizedContextValue = useMemo(() => ({ IS_WEB: isWeb }), [isWeb]);

  return (
    <context.Provider value={memoizedContextValue}>{children}</context.Provider>
  );
};

export function useAppContext() {
  const envContext = useContext(context);

  if (!envContext) {
    throw new Error("App context must be used within AppProvider");
  }

  return envContext;
}
