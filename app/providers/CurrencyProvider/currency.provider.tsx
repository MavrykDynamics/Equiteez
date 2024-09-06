import { useQuery } from '@tanstack/react-query';
import { createContext, FC, useContext, useMemo } from 'react';
import { MARS_TOKEN_SLUG, OCEAN_TOKEN_SLUG } from '~/lib/assets';
import { fetchFiatToTezosRates } from '~/lib/fiat-currency';
import { fetchUsdToTokenRates } from '~/lib/mavryk/endpoints/get-exchange-rates';

type CurrencyContext = {
  usdToTokenRates: {
    [x: string]: string;
  };
  fiatToTezosRates: Record<string, number>;
  isLoading: boolean;
};

export const context = createContext<CurrencyContext>(undefined!);

export const CurrencyProvider: FC<PropsWithChildren> = ({ children }) => {
  const { isLoading, data: fiatToTezosRates } = useQuery({
    queryKey: ['fiatToTezos'],
    queryFn: () => fetchFiatToTezosRates(),
  });
  const { isLoading: isUsdLoading, data: usdToTokenRates } = useQuery({
    queryKey: ['usdToToken'],
    queryFn: () => fetchUsdToTokenRates(),
  });

  const memoizedCtxValue = useMemo(
    () => ({
      usdToTokenRates: {
        ...usdToTokenRates,
        // TODO take rates for rwa tokens, remove later
        [MARS_TOKEN_SLUG]: '51.094475357904031783253356',
        [OCEAN_TOKEN_SLUG]: '72.844475357904031783253356',
      },
      fiatToTezosRates: fiatToTezosRates ?? {},
      isLoading: isLoading || isUsdLoading,
    }),
    [fiatToTezosRates, isLoading, isUsdLoading, usdToTokenRates]
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
