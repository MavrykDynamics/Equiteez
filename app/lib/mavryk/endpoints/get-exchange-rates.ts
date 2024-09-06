import { toTokenSlug } from '~/lib/assets';
import { mavrykApi } from './mavryk.api';

interface GetExchangeRatesResponseItem {
  tokenAddress?: string;
  tokenId?: number;
  exchangeRate: string;
}

export const fetchUsdToTokenRates = () =>
  mavrykApi
    .get<GetExchangeRatesResponseItem[]>('/exchange-rates')
    .then(({ data }) => {
      const prices: StringRecord = {};

      for (const { tokenAddress, tokenId, exchangeRate } of data) {
        if (tokenAddress) {
          prices[toTokenSlug(tokenAddress, tokenId)] = exchangeRate;
        } else {
          prices.mav = exchangeRate;
        }
      }

      return prices;
    });
