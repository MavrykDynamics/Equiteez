import { createContext, FC, useContext, useMemo } from 'react';
import { environment } from './environment.server';

type EnvContent = {
  env: ReturnType<typeof environment>;
};

const context = createContext<EnvContent>(undefined!);

type EnvProviderProps = {
  publicKeys: ReturnType<typeof environment>;
} & PropsWithChildren;

export const EnvProvider: FC<EnvProviderProps> = ({ publicKeys, children }) => {
  const memoizedContextValue = useMemo(
    () => ({ env: publicKeys }),
    [publicKeys]
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
