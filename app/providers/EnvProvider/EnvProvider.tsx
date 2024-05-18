import {
  createContext,
  FC,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type EnvContent = {
  env: Env;
  IS_WEB: boolean;
};

const context = createContext<EnvContent>(undefined!);

type EnvProviderProps = {
  env: Env;
} & PropsWithChildren;

export const EnvProvider: FC<EnvProviderProps> = ({ env, children }) => {
  const [isWeb, setIsWeb] = useState(false);

  useEffect(() => {
    setIsWeb(typeof window !== 'undefined');
  }, []);

  const memoizedContextValue = useMemo(
    () => ({ env, IS_WEB: isWeb }),
    [env, isWeb]
  );

  return (
    <context.Provider value={memoizedContextValue}>{children}</context.Provider>
  );
};

export function useEnvContext() {
  const envContext = useContext(context);

  if (!envContext) {
    throw new Error('Env context must be used within EnvProvider');
  }

  return envContext;
}
