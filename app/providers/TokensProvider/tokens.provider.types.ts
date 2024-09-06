import { TokenMetadata } from '~/lib/metadata';

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
