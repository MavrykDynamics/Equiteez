import { useMemo } from 'react';

import { BigNumber } from 'bignumber.js';

import { FIAT_CURRENCIES } from './consts';
import type { FiatCurrencyOption } from './types';
import { isDefined, isTruthy } from '../utils';
import { useCurrencyContext } from '~/providers/CurrencyProvider/currency.provider';
import { useStorage } from '../utils/local-storage';

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

// TODO there was tezos: {usd: 1.6} from coincheck api
// const feedsQuery = `
//     query dataFeedsPrices {
//       aggregator: aggregator(where: { admin: { _neq: "" } }, order_by: { creation_timestamp: desc }) {
//         address
//         name
//         decimals
//         last_completed_data
//         last_completed_data_pct_oracle_resp
//         last_completed_data_last_updated_at
//         last_completed_data_epoch
//       }
//     }
//   `;

// export const fetchFiatToTezosRates = async () => {
//   try {
//     const { data } = await api<{ data: { aggregator: TokenPricesFeedsType } }>(
//       'https://api.mavenfinance.io/v1/graphql',
//       {
//         method: 'POST',
//         body: JSON.stringify({ query: feedsQuery }),
//       }
//     );

//     const mappedRates = normalizeTokenPrices(data.data.aggregator);

//     return { mappedRates, usd: 1.6 };
//   } catch (e) {
//     throw new Error('Error while fetching tezos rates');
//   }
// };

// export const normalizeTokenPrices = (feedsLedger: TokenPricesFeedsType) => {
//   return feedsLedger.reduce<Record<string, number>>((acc, feedGql) => {
//     const { symbol } = getTokenSymbolAndName(feedGql.name) ?? {};

//     if (symbol) {
//       acc[symbol] = atomsToTokens(
//         feedGql.last_completed_data,
//         feedGql.decimals
//       ).toNumber();
//     }
//     return acc;
//   }, {});
// };
