import { toTokenSlug } from '~/lib/assets';
import { api } from '~/lib/utils/api';

const mavrykApi = new URL('/api', process.env.MAVRYK_WALLET_API_URL).href;

interface GetExchangeRatesResponseItem {
  tokenAddress?: string;
  tokenId?: number;
  exchangeRate: string;
}

export const fetchUsdToTokenRates = async () => {
  try {
    const { data } = await api<GetExchangeRatesResponseItem[]>(
      mavrykApi.concat('/exchange-rates')
    );

    const prices: StringRecord = {};

    for (const { tokenAddress, tokenId, exchangeRate } of data) {
      if (tokenAddress) {
        prices[toTokenSlug(tokenAddress, tokenId)] = exchangeRate;
      } else {
        prices.mav = exchangeRate;
      }
    }

    return prices;
  } catch (e) {
    throw new Error('Error while fetching usd to token rates');
  }
};
