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
import {
  MVRK_ASSET_SLUG,
  MVRK_CONTRACT_ADDRESS,
  MVRK_METADATA,
  TokenMetadata,
} from '~/lib/metadata';
import { fetchTokensMetadata } from './utils/fetchTokensdata';
// import { MARS1_TOKEN_ADDRESS, OCEAN_TOKEN_ADDRESS } from '~/consts/contracts';

const tokensContext = createContext<TokensProviderCtx>(undefined!);

type TokensProviderProps = {
  initialTokens: TokenType[];
} & PropsWithChildren;

export const TokensProvider: FC<TokensProviderProps> = ({
  initialTokens,
  children,
}) => {
  const [tokens, setTokens] = useState<TokenType[]>([]);
  const [tokensMetadata, setTokensMetadata] = useState<
    StringRecord<TokenMetadata>
  >({});
  const [isLoading, setIsLoading] = useState(true);

  const initializeTokensData = useCallback(async () => {
    try {
      setTokens(
        initialTokens.concat({
          contract: MVRK_CONTRACT_ADDRESS,
          id: MVRK_METADATA.id,
        })
      );

      const initialTokensMetadata = await fetchTokensMetadata(initialTokens);

      setTokensMetadata({
        ...initialTokensMetadata,
        [MVRK_ASSET_SLUG]: MVRK_METADATA,
      });

      setIsLoading(false);
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  }, [initialTokens]);

  /**Fetch tokens and tokens metadta on init */
  useEffect(() => {
    initializeTokensData();
  }, [initializeTokensData]);

  const memoizedTokensCtx: TokensProviderCtx = useMemo(
    () => ({
      tokens,
      tokensMetadata,
      isLoading,
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
