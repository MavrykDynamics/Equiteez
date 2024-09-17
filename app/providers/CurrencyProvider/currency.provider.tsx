import { createContext, FC, useContext, useMemo } from 'react';
import { MARS_TOKEN_SLUG, OCEAN_TOKEN_SLUG } from '~/lib/assets';

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
        // TODO take rates for rwa tokens, remove later
        [MARS_TOKEN_SLUG]: '51.094475357904031783253356',
        [OCEAN_TOKEN_SLUG]: '72.844475357904031783253356',
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
