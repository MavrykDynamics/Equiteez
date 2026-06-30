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

const getTokenKey = ({ contract, id }: TokenType) => `${contract}_${id}`;

const mergeTokens = (currentTokens: TokenType[], nextTokens: TokenType[]) => {
  const tokenKeys = new Set(currentTokens.map(getTokenKey));
  let hasChanges = false;

  const mergedTokens = [...currentTokens];

  nextTokens.forEach((token) => {
    const key = getTokenKey(token);

    if (tokenKeys.has(key)) {
      return;
    }

    tokenKeys.add(key);
    mergedTokens.push(token);
    hasChanges = true;
  });

  return hasChanges ? mergedTokens : currentTokens;
};

const mergeTokensMetadata = (
  currentMetadata: StringRecord<TokenMetadata>,
  nextMetadata: StringRecord<TokenMetadata>
) => {
  let hasChanges = false;
  const mergedMetadata = { ...currentMetadata };

  Object.entries(nextMetadata).forEach(([slug, metadata]) => {
    const currentTokenMetadata = currentMetadata[slug];

    if (
      currentTokenMetadata?.name === metadata.name &&
      currentTokenMetadata?.symbol === metadata.symbol &&
      currentTokenMetadata?.decimals === metadata.decimals &&
      currentTokenMetadata?.thumbnailUri === metadata.thumbnailUri &&
      currentTokenMetadata?.address === metadata.address &&
      currentTokenMetadata?.id === metadata.id
    ) {
      return;
    }

    mergedMetadata[slug] = metadata;
    hasChanges = true;
  });

  return hasChanges ? mergedMetadata : currentMetadata;
};

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
      const nextTokens = initialTokens
        .concat({
          contract: MVRK_CONTRACT_ADDRESS,
          id: MVRK_METADATA.id,
        })
        .concat(
          MOCKED_ASSET_ADDRESSES.map((address) => ({
            contract: address,
            id: "0",
          }))
        );

      const nextTokensMetadata = {
        ...initialTokensMetadata,
        [MVRK_ASSET_SLUG]: MVRK_METADATA,
        ...MOCKED_ASSET_ADDRESSES.reduce<StringRecord<TokenMetadata>>(
          (acc, address) => {
            const slug = toTokenSlug(address);
            const symbol =
              MOCKED_ASSET_SYMBOLS[
                address as keyof typeof MOCKED_ASSET_SYMBOLS
              ] ?? "NMDT";

            acc[slug] = getMockedMetadata(address, symbol);
            return acc;
          },
          {}
        ),
      };

      setTokens((currentTokens) => mergeTokens(currentTokens, nextTokens));
      setTokensMetadata((currentMetadata) =>
        mergeTokensMetadata(currentMetadata, nextTokensMetadata)
      );

      setIsLoading(false);
    } catch (e) {
      console.log(e);
      setIsLoading(false);
    }
  }, [initialTokens, initialTokensMetadata]);

  const upsertTokensData = useCallback(
    (
      nextTokens: TokenType[],
      nextTokensMetadata: StringRecord<TokenMetadata>
    ) => {
      setTokens((currentTokens) => mergeTokens(currentTokens, nextTokens));
      setTokensMetadata((currentMetadata) =>
        mergeTokensMetadata(currentMetadata, nextTokensMetadata)
      );
    },
    []
  );

  /**Fetch tokens and tokens metadta on init */
  useEffect(() => {
    initializeTokensData();
  }, [initializeTokensData]);

  const memoizedTokensCtx: TokensProviderCtx = useMemo(
    () => ({
      tokens,
      tokensMetadata,
      isLoading,
      upsertTokensData,
    }),
    [isLoading, tokens, tokensMetadata, upsertTokensData]
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
