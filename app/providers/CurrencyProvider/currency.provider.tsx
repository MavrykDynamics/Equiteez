import { createContext, FC, useContext, useMemo } from 'react';

type CurrencyContext = {
  usdToTokenRates: {
    [x: string]: string;
  };
  fiatToTezosRates: Record<string, number>;
};

export const context = createContext<CurrencyContext>(undefined!);

type CurrencyProviderProps = {
  fiatToTezos: Record<string, number>;
  usdToToken: StringRecord<string>;
} & PropsWithChildren;

export const CurrencyProvider: FC<CurrencyProviderProps> = ({
  fiatToTezos,
  usdToToken,
  children,
}) => {
  const memoizedCtxValue = useMemo(
    () => ({
      usdToTokenRates: {
        ...usdToToken,
      },
      fiatToTezosRates: fiatToTezos,
    }),
    [fiatToTezos, usdToToken]
  );

  return (
    <context.Provider value={memoizedCtxValue}>{children}</context.Provider>
  );
};

export function useCurrencyContext() {
  const ctx = useContext(context);

  if (!ctx) {
    throw new Error(
      'useCurrencyContext context must be used within CurrencyProvider'
    );
  }

  return ctx;
}
