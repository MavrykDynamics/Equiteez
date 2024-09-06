import { useMemo } from 'react';

import { BigNumber } from 'bignumber.js';
import { useTokensContext } from '~/providers/TokensProvider/tokens.provider';
import { useUsdToTokenRates } from '../fiat-currency';
import { convertRawValueToSelectedCurrency } from '~/util/formaters';

export enum SortOptions {
  HIGH_TO_LOW = 'highToLow',
  LOW_TO_HIGH = 'lowToHigh',
  BY_NAME = 'byName',
}

export function useSortededAssetsSlugs(
  sortOption: SortOptions | null,
  assetsSlugs: string[],
  balances: StringRecord<string>
) {
  const { tokensMetadata } = useTokensContext();
  const usdToTokenRates = useUsdToTokenRates();

  const assetsSlugNames = useMemo(
    () =>
      assetsSlugs.map((slug) => ({
        name: tokensMetadata[slug]?.name ?? 'Unknwon token',
        slug,
      })),
    [assetsSlugs, tokensMetadata]
  );

  let sortedAssetSlugs = assetsSlugs;

  switch (sortOption) {
    case SortOptions.BY_NAME:
      sortedAssetSlugs = assetsSlugNames
        .sort((a, b) =>
          a.name.toLowerCase().localeCompare(b.name.toLowerCase())
        )
        .map((asset) => asset.slug);
      break;

    case SortOptions.HIGH_TO_LOW:
      sortedAssetSlugs = sortedAssetSlugs.sort((a, b) => {
        const tokenABalance =
          convertRawValueToSelectedCurrency(
            balances[a],
            tokensMetadata[a],
            usdToTokenRates[a]
          ) ?? new BigNumber(0);
        const tokenBBalance =
          convertRawValueToSelectedCurrency(
            balances[b],
            tokensMetadata[b],
            usdToTokenRates[b]
          ) ?? new BigNumber(0);

        return tokenBBalance.comparedTo(tokenABalance);
      });
      break;

    case SortOptions.LOW_TO_HIGH:
      sortedAssetSlugs = sortedAssetSlugs.sort((a, b) => {
        const tokenABalance =
          convertRawValueToSelectedCurrency(
            balances[a],
            tokensMetadata[a],
            usdToTokenRates[a]
          ) ?? new BigNumber(0);
        const tokenBBalance =
          convertRawValueToSelectedCurrency(
            balances[b],
            tokensMetadata[b],
            usdToTokenRates[b]
          ) ?? new BigNumber(0);

        return tokenABalance.comparedTo(tokenBBalance);
      });
      break;

    default:
      sortedAssetSlugs = [...sortedAssetSlugs];
  }

  return [...new Set([...sortedAssetSlugs])];
}
