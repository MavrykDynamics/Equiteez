/* eslint-disable @typescript-eslint/no-explicit-any */
import { useTokensContext } from '~/providers/TokensProvider/tokens.provider';
import { AssetMetadataBase, TokenMetadata } from '../metadata/types';
import _ from 'lodash';
const { isString } = _;
import { isMavAsset } from '../assets';
import { MVRK_METADATA } from './defaults';
import { useCallback } from 'react';

export * from './defaults';

export const useAssetMetadata = (slug: string) => {
  const { tokensMetadata } = useTokensContext();

  return tokensMetadata[slug];
};

export function getAssetSymbol(
  metadata: AssetMetadataBase | nullish,
  short = false
) {
  if (!metadata) return '???';
  if (!short) return metadata.symbol;
  return metadata.symbol === 'mav' ? 'ꝳ' : metadata.symbol.substring(0, 5);
}

export function getAssetName(metadata: AssetMetadataBase | nullish) {
  return metadata ? metadata.name : 'Unknown Token';
}

/** Empty string for `artifactUri` counts */
export const isCollectible = (metadata: Record<string, any>) =>
  'artifactUri' in metadata && isString(metadata.artifactUri);

export const isRwa = (metadata: Record<string, any>) =>
  'symbol' in metadata &&
  (metadata.symbol === 'OCEAN' || metadata.symbol === 'MARS1');
/**
 * @deprecated // Assertion here is not safe!
 */
export const isCollectibleTokenMetadata = (
  metadata: AssetMetadataBase
): metadata is TokenMetadata => isCollectible(metadata);

export const useMultipleAssetsMetadata = (
  slugs: string[]
): AssetMetadataBase[] | undefined => {
  const { tokensMetadata } = useTokensContext();

  return slugs.map((s) => {
    if (isMavAsset(s)) return MVRK_METADATA;
    return tokensMetadata[s];
  });
};

export const useGetTokenOrGasMetadata = () => {
  const { tokensMetadata } = useTokensContext();

  return useCallback(
    (slug: string): AssetMetadataBase | undefined =>
      isMavAsset(slug) ? MVRK_METADATA : tokensMetadata[slug],
    [tokensMetadata]
  );
};

export * from './types';
