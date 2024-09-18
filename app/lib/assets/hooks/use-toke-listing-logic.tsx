import { useCallback, useMemo, useState } from 'react';

import _ from 'lodash';
import { useDebounce } from 'use-debounce';

import { toTokenSlug } from 'app/lib/assets';
import { searchAssetsWithNoMeta } from 'app/lib/assets/search.utils';
import { useTokensSortPredicate } from 'app/lib/assets/use-sorting';
import { useGetTokenOrGasMetadata } from 'app/lib/metadata';
import { useMemoWithCompare } from 'app/lib/ui/hooks';
import { isSearchStringApplicable } from 'app/lib/utils/search-items';
import { isDefined } from '~/lib/utils';
import { useTokensContext } from '~/providers/TokensProvider/tokens.provider';
import { useUsdToTokenRates } from '~/lib/fiat-currency';
import { convertRawValueToSelectedCurrency } from '~/lib/utils/formaters';

export const useTokensListingLogic = (
  assetsSlugs: string[],
  balances: StringRecord<string>,
  filterZeroBalances = false,
  leadingAssets?: string[],
  leadingAssetsAreFilterable = false
) => {
  const { tokensMetadata } = useTokensContext();
  const usdToTokenRates = useUsdToTokenRates();

  const nonLeadingAssets = useMemo(
    () =>
      leadingAssets?.length
        ? assetsSlugs.filter((slug) => !leadingAssets.includes(slug))
        : assetsSlugs,
    [assetsSlugs, leadingAssets]
  );

  const isNonZeroBalance = useCallback(
    (slug: string) => {
      const balance = balances[slug];
      const currencyBalance = convertRawValueToSelectedCurrency(
        balance,
        tokensMetadata[slug],
        usdToTokenRates[slug]
      );

      return isDefined(currencyBalance) && !currencyBalance.isZero();
    },
    [balances, tokensMetadata, usdToTokenRates]
  );

  const sourceArray = useMemo(
    () =>
      filterZeroBalances
        ? nonLeadingAssets.filter(isNonZeroBalance)
        : nonLeadingAssets,
    [filterZeroBalances, nonLeadingAssets, isNonZeroBalance]
  );

  const [searchValue, setSearchValue] = useState('');
  const [tokenId, setTokenId] = useState<number>();
  const [searchValueDebounced] = useDebounce(
    tokenId ? toTokenSlug(searchValue, String(tokenId)) : searchValue,
    300
  );

  const assetsSortPredicate = useTokensSortPredicate(balances);
  const getMetadata = useGetTokenOrGasMetadata();

  const searchedSlugs = useMemo(
    () =>
      isSearchStringApplicable(searchValueDebounced)
        ? searchAssetsWithNoMeta(
            searchValueDebounced,
            sourceArray,
            getMetadata,
            (slug) => slug
          )
        : [...sourceArray].sort(assetsSortPredicate),
    [searchValueDebounced, sourceArray, getMetadata, assetsSortPredicate]
  );

  const filteredAssets = useMemoWithCompare(
    () => {
      if (!isDefined(leadingAssets) || !leadingAssets.length)
        return searchedSlugs;

      const filteredLeadingSlugs =
        leadingAssetsAreFilterable && filterZeroBalances
          ? leadingAssets.filter(isNonZeroBalance)
          : leadingAssets;

      const searchedLeadingSlugs = searchAssetsWithNoMeta(
        searchValueDebounced,
        filteredLeadingSlugs,
        getMetadata,
        (slug) => slug
      );

      return searchedLeadingSlugs.length
        ? searchedLeadingSlugs.concat(searchedSlugs)
        : searchedSlugs;
    },
    [
      leadingAssets,
      leadingAssetsAreFilterable,
      filterZeroBalances,
      isNonZeroBalance,
      searchedSlugs,
      searchValueDebounced,
      getMetadata,
    ],
    _.isEqual
  );

  return {
    filteredAssets,
    searchValue,
    setSearchValue,
    tokenId,
    setTokenId,
  };
};
