import { useSubscription } from "@apollo/client/index";
import { createContext, FC, useContext, useMemo } from "react";
import { DIP_DUP_QUERY } from "./queries/dipDup.query";
import { dipdupLvlSchema } from "./dipdup.schema";
import { currentDipdupLvlProxy } from "./utils/observeCurrentIndexerLevel";
import { useAppContext } from "../AppProvider/AppProvider";

type DipdupContext = {
  headLvl: number;
};

export const context = createContext<DipdupContext>(undefined!);

type DipdupProviderProps = PropsWithChildren;

export const DipdupProvider: FC<DipdupProviderProps> = ({ children }) => {
  const { IS_WEB } = useAppContext();

  /**
   * Subscribe to lvl that currently performed by EQuiteez API, to:
   *
   * 1. refetch queries, that requires update on lvl change
   */
  useSubscription(DIP_DUP_QUERY, {
    skip: !IS_WEB,
    shouldResubscribe: true,
    onData: ({ data: { data } }) => {
      if (!data) return;
      try {
        const parsedLevelData = dipdupLvlSchema.parse(data.dipdup_head);

        if (
          currentDipdupLvlProxy.currentDipdupeddLevel < parsedLevelData[0].level
        ) {
          if (process.env.NODE_ENV === "development")
            console.log(
              `%cnew indexer level: ${parsedLevelData[0].level}`,
              "color: fuchsia"
            );

          currentDipdupLvlProxy.currentDipdupeddLevel =
            parsedLevelData[0].level;
        }
      } catch (e) {
        console.log("zod parsing SUBSCRIPTION_INDEXER_LVL error:", { e });
      }
    },
    onError: (error) => {
      console.error(error, "SUBSCRIPTION_INDEXER_LVL");
    },
  });

  const memoizedContextValue = useMemo(() => ({ headLvl: 1 }), []);

  return (
    <context.Provider value={memoizedContextValue}>{children}</context.Provider>
  );
};

export function useDipdupContext() {
  const envContext = useContext(context);

  if (!envContext) {
    throw new Error("Dipdup context must be used within DipdupProvider");
  }

  return envContext;
}
