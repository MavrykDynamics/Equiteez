import {
  createContext,
  useState,
  useMemo,
  useContext,
  PropsWithChildren,
  FC,
} from "react";
import { ConfigProviderCtxType } from "./config.provider.types";
import { useQuery } from "@apollo/client/index";
import { CONFIG_QUERY } from "./queries/config.query";
import { useApolloContext } from "../ApolloProvider/apollo.provider";
import { configQuerySchema } from "./queries/config.schema";

const configContext = createContext<ConfigProviderCtxType>(undefined!);

export const ConfigProvider: FC<PropsWithChildren> = ({ children }) => {
  const { handleApolloError } = useApolloContext();

  const [configState, setConfigState] = useState<ConfigProviderCtxType>({
    adminAddress: "",
  });

  useQuery(CONFIG_QUERY, {
    onCompleted: (data) => {
      try {
        const parsedData = configQuerySchema.parse(data);
        setConfigState({
          adminAddress: parsedData.super_admin[0].address,
        });
      } catch (e) {
        console.error(e);
      }
    },
    onError: (error) => {
      handleApolloError(error, "CONFIG_QUERY");
    },
  });

  const memoizedConfigValue = useMemo(
    () => ({ ...configState }),
    [configState]
  );
  return (
    <configContext.Provider value={memoizedConfigValue}>
      {children}
    </configContext.Provider>
  );
};

export const useConfigContext = () => {
  const context = useContext(configContext);

  if (!context) {
    throw new Error("configContext should be used within ConfigProvider");
  }

  return context;
};
