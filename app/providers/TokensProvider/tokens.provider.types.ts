import { z } from 'zod';

export const tokenStandartEnum = z.enum(['fa2', 'mav', 'fa12', 'fa1.2']);
export type TokenStandart = z.infer<typeof tokenStandartEnum>;

export const tokenMetadataSchema = z.object({
  standard: tokenStandartEnum,
  decimals: z.number(),
  symbol: z.string(),
  name: z.string(),
  shouldPreferSymbol: z.boolean().optional(),
  thumbnailUri: z.string().optional(),
});

export type TokenMetadata = z.infer<typeof tokenMetadataSchema>;

export type TokenType = {
  contract: string;
  id: string;
};

export type TokensProviderCtx = {
  tokens: TokenType[];
  tokensMetadata: StringRecord<TokenMetadata>;
  tokensPrices: StringRecord<number>;
  isLoading: boolean;
};
