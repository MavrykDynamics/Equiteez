import { useCurrencyContext } from '~/providers/CurrencyProvider/currency.provider';
import { useGetCurrentAccountTokenOrGasBalanceWithDecimals } from '../balances';
import { useCallback } from 'react';
import { ZERO } from '../utils/numbers';

export const useTokensSortPredicate = (balances: StringRecord<string>) => {
  const getBalance =
    useGetCurrentAccountTokenOrGasBalanceWithDecimals(balances);
  const { usdToTokenRates } = useCurrencyContext();

  return useCallback(
    (aSlug: string, bSlug: string) => {
      const aBalance = getBalance(aSlug) ?? ZERO;
      const bBalance = getBalance(bSlug) ?? ZERO;
      const aEquity = aBalance.multipliedBy(usdToTokenRates[aSlug] ?? ZERO);
      const bEquity = bBalance.multipliedBy(usdToTokenRates[bSlug] ?? ZERO);

      if (aEquity.isEqualTo(bEquity)) {
        return bBalance.comparedTo(aBalance);
      }

      return bEquity.comparedTo(aEquity);
    },
    [getBalance, usdToTokenRates]
  );
};
