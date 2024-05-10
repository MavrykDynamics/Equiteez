import { createContext, FC, useContext, useMemo } from 'react';

type EnvContent = {
  env: Env;
};

const context = createContext<EnvContent>(undefined!);

type EnvProviderProps = {
  env: Env;
} & PropsWithChildren;

export const EnvProvider: FC<EnvProviderProps> = ({ env, children }) => {
  const memoizedContextValue = useMemo(() => ({ env }), [env]);

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
