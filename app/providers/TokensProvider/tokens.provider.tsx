import {
  createContext,
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { TokensProviderCtx, TokenType } from './tokens.provider.types';
import { fetchTokensData, fetchTokensMetadata } from './utils/fetchTokensdata';
import {
  MVRK_ASSET_SLUG,
  MVRK_CONTRACT_ADDRESS,
  MVRK_METADATA,
  TokenMetadata,
} from '~/lib/metadata';
// import { MARS1_TOKEN_ADDRESS, OCEAN_TOKEN_ADDRESS } from '~/consts/contracts';

const tokensContext = createContext<TokensProviderCtx>(undefined!);

export const TokensProvider: FC<PropsWithChildren> = ({ children }) => {
  const [tokens, setTokens] = useState<TokenType[]>([]);
  const [tokensMetadata, setTokensMetadata] = useState<
    StringRecord<TokenMetadata>
  >({});
  const [isLoading, setIsLoading] = useState(true);

  const initializeTokensData = useCallback(async () => {
    try {
      const tokens = await fetchTokensData();
      const tokensMetadata = await fetchTokensMetadata(tokens);
      setTokens(
        tokens.concat({ contract: MVRK_CONTRACT_ADDRESS, id: MVRK_METADATA.id })
      );

      setTokensMetadata({
        ...tokensMetadata,
        [MVRK_ASSET_SLUG]: MVRK_METADATA,
      });
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
    }
  }, []);

  /**Fetch tokens and tokens metadta on init */
  useEffect(() => {
    initializeTokensData();
  }, []);

  const memoizedTokensCtx: TokensProviderCtx = useMemo(
    () => ({
      tokens,
      tokensMetadata,
      isLoading,
      tokensPrices: {
        // [OCEAN_TOKEN_ADDRESS]: 54,
        // [MARS1_TOKEN_ADDRESS]: 45,
      },
    }),
    [isLoading, tokens, tokensMetadata]
  );

  return (
    <tokensContext.Provider value={memoizedTokensCtx}>
      {children}
    </tokensContext.Provider>
  );
};

export const useTokensContext = () => {
  const context = useContext(tokensContext);

  if (!context) {
    throw new Error(
      `${useTokensContext.name} must ne used within ${TokensProvider.name}`
    );
  }

  return context;
};
