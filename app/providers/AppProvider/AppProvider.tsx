// import { useSubscription } from "@apollo/client/index";
import {
  createContext,
  FC,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
// import { DIP_DUP_QUERY } from "./queries/dipDup.query";
// import { currentDipdupLvlProxy } from "./utils/observeCurrentIndexerLevel";
// import { useApolloContext } from "../ApolloProvider/apollo.provider";
// import { dipdupLvlSchema } from "./app.schema";

type AppContext = {
  IS_WEB: boolean;
};

export const context = createContext<AppContext>(undefined!);

type AppProviderProps = PropsWithChildren;

export const AppProvider: FC<AppProviderProps> = ({ children }) => {
  // const { handleApolloError } = useApolloContext();
  const [isWeb, setIsWeb] = useState(false);

  /**
   * Subscribe to lvl that currently performed by EQuiteez API, to:
   *
   * 1. refetch queries, that requires update on lvl change
   */
  // const { data: dipdupLvl } = useSubscription(DIP_DUP_QUERY, {
  //   shouldResubscribe: true,
  //   onData: ({ data: { data } }) => {
  //     if (!data) return;
  //     try {
  //       const parsedLevelData = dipdupLvlSchema.parse(data.dipdup_head);

  //       if (
  //         currentDipdupLvlProxy.currentDipdupeddLevel < parsedLevelData[0].level
  //       ) {
  //         if (process.env.REACT_APP_ENV === "prod")
  //           console.log(
  //             `%cnew indexer level: ${parsedLevelData[0].level}`,
  //             "color: fuchsia"
  //           );

  //         currentDipdupLvlProxy.currentDipdupeddLevel =
  //           parsedLevelData[0].level;
  //       }
  //     } catch (e) {
  //       console.error("zod parsing SUBSCRIPTION_INDEXER_LVL error:", { e });
  //     }
  //   },
  //   onError: (error) => {
  //     handleApolloError(error, "SUBSCRIPTION_INDEXER_LVL");
  //   },
  // });

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
