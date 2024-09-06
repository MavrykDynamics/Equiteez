import { useMemo } from 'react';

import axios from 'axios';
import { BigNumber } from 'bignumber.js';

import { FIAT_CURRENCIES } from './consts';
import type { FiatCurrencyOption, CoingeckoFiatInterface } from './types';
import { isDefined, isTruthy } from '../utils';
import { useCurrencyContext } from '~/providers/CurrencyProvider/currency.provider';
import { useStorage } from '~/util/local-storage';

const FIAT_CURRENCY_STORAGE_KEY = 'fiat_currency';

export const useUsdToTokenRates = () => {
  const { usdToTokenRates } = useCurrencyContext();

  const proxyObj = new Proxy(usdToTokenRates, {
    get(target, prop: string) {
      // Return 0 if the property does not exist on the target object
      return prop in target ? target[prop] : '0';
    },
  });
  return proxyObj;
};

function useAssetUSDPrice(slug: string) {
  const usdToTokenRates = useUsdToTokenRates();

  return useMemo(() => {
    const rateStr = usdToTokenRates[slug];
    return rateStr ? Number(rateStr) : undefined;
  }, [slug, usdToTokenRates]);
}

export const useFiatToUsdRate = () => {
  const { fiatRates, selectedFiatCurrency } = useFiatCurrency();

  const { name: selectedFiatCurrencyName = 'usd' } = selectedFiatCurrency;

  return useMemo(() => {
    if (!isDefined(fiatRates)) return;

    const fiatRate = fiatRates[selectedFiatCurrencyName.toLowerCase()] ?? 1;
    const usdRate = fiatRates['usd'] ?? 1;

    return fiatRate / usdRate;
  }, [fiatRates, selectedFiatCurrencyName]);
};

export function useAssetFiatCurrencyPrice(slug: string): BigNumber {
  const fiatToUsdRate = useFiatToUsdRate();
  const usdToTokenRate = useAssetUSDPrice(slug);

  return useMemo(() => {
    if (!isTruthy(usdToTokenRate) || !isTruthy(fiatToUsdRate))
      return new BigNumber(0);

    return BigNumber(fiatToUsdRate).times(usdToTokenRate);
  }, [fiatToUsdRate, usdToTokenRate]);
}

export const useFiatCurrency = () => {
  const { fiatToTezosRates } = useCurrencyContext();

  const [selectedFiatCurrency, setSelectedFiatCurrency] =
    useStorage<FiatCurrencyOption>(
      FIAT_CURRENCY_STORAGE_KEY,
      FIAT_CURRENCIES[0]!
    );

  return {
    selectedFiatCurrency,
    setSelectedFiatCurrency,
    fiatRates: fiatToTezosRates,
  };
};

const coingeckoApi = axios.create({
  baseURL: 'https://api.coingecko.com/api/v3/',
});

export const fetchFiatToTezosRates = () =>
  coingeckoApi
    .get<CoingeckoFiatInterface>(
      `/simple/price?ids=tezos&vs_currencies=${FIAT_CURRENCIES.map(
        ({ apiLabel }) => apiLabel
      ).join(',')}`
    )
    .then(({ data }) => {
      const mappedRates: Record<string, number> = {};
      const tezosData = Object.keys(data.tezos);

      for (const quote of tezosData) {
        mappedRates[quote] = data.tezos[quote];
      }

      return mappedRates;
    });
