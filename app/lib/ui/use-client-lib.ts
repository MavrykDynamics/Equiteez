import { useState } from 'react';

export const useClientLibData = <T>() => {
  const [clientModule, setClientModule] = useState<T | null>(null);
  const [clientModuleError, setClientModuleError] = useState(null);

  return {
    clientModule: clientModule as T,
    loading: !clientModule,
    setClientModule,
    clientModuleError,
    setClientModuleError,
  };
};
