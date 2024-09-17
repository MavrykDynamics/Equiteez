import { useCallback, useMemo } from 'react';
import { useAssetMetadata } from '../metadata';
import BigNumber from 'bignumber.js';
import { useTokensContext } from '~/providers/TokensProvider/tokens.provider';
import { atomsToTokens } from '../utils/formaters';

export function useBalance(rawValue: string, assetSlug: string) {
  const assetMetadata = useAssetMetadata(assetSlug);

  const value = useMemo(
    () =>
      rawValue && assetMetadata
        ? atomsToTokens(new BigNumber(rawValue), assetMetadata.decimals)
        : undefined,
    [rawValue, assetMetadata]
  );

  return { rawValue, value, assetMetadata };
}

export const useGetCurrentAccountTokenOrGasBalanceWithDecimals = (
  rawBalances: StringRecord<string>
) => {
  const { tokensMetadata } = useTokensContext();
  return useCallback(
    (slug: string) => {
      const rawBalance = rawBalances[slug] as string | undefined;
      const metadata = tokensMetadata[slug];

      return rawBalance && metadata
        ? atomsToTokens(new BigNumber(rawBalance), metadata.decimals)
        : undefined;
    },
    [rawBalances, tokensMetadata]
  );
};
