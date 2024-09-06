import { TokenMetadata } from '~/lib/metadata';

export const getTokenDataByAddress = ({
  tokenAddress,
  tokensMetadata,
  tokensPrices,
}: {
  tokenAddress?: string;
  tokensMetadata: StringRecord<TokenMetadata>;
  tokensPrices?: StringRecord<number>;
}) => {
  if (!tokenAddress) return null;

  const tokenMetadata = tokensMetadata[tokenAddress];

  if (!tokenMetadata) return null;

  const tokenRate = tokensPrices?.[tokenMetadata.symbol] ?? 1;

  if (!tokenRate) return { ...tokenMetadata, rate: null };

  return { ...tokenMetadata, rate: tokenRate };
};
