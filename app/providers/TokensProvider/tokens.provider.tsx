import {
  createContext,
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { TokensProviderCtx, TokenType } from "./tokens.provider.types";
import {
  getMockedMetadata,
  MOCKED_ASSET_ADDRESSES,
  MOCKED_ASSET_SYMBOLS,
  MVRK_ASSET_SLUG,
  MVRK_CONTRACT_ADDRESS,
  MVRK_METADATA,
  TokenMetadata,
} from "~/lib/metadata";
import { toTokenSlug } from "~/lib/assets";

const tokensContext = createContext<TokensProviderCtx>(undefined!);

type TokensProviderProps = {
  initialTokens: TokenType[];
  initialTokensMetadata: StringRecord<TokenMetadata>;
} & PropsWithChildren;

export const TokensProvider: FC<TokensProviderProps> = ({
  initialTokens,
  initialTokensMetadata,
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
        initialTokens
          .concat({
            contract: MVRK_CONTRACT_ADDRESS,
            id: MVRK_METADATA.id,
          })
          .concat(
            MOCKED_ASSET_ADDRESSES.map((address) => ({
              contract: address,
              id: "0",
            }))
          )
      );

      setTokensMetadata({
        ...initialTokensMetadata,
        [MVRK_ASSET_SLUG]: MVRK_METADATA,
        ...MOCKED_ASSET_ADDRESSES.reduce<StringRecord<TokenMetadata>>(
          (acc, address) => {
            const slug = toTokenSlug(address);
            acc[slug] = getMockedMetadata(
              address,
              MOCKED_ASSET_SYMBOLS[address] ?? "NMDT"
            );
            return acc;
          },
          {}
        ),
      });

      setIsLoading(false);
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  }, [initialTokens, initialTokensMetadata]);

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
