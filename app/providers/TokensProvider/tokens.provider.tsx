import {
  createContext,
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  TokenMetadata,
  TokensProviderCtx,
  TokenType,
} from './tokens.provider.types';
import { fetchTokensData, fetchTokensMetadata } from './utils/fetchTokensdata';

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
      setTokens(tokens);
      setTokensMetadata(tokensMetadata);
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
      tokensPrices: {},
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
