import { useMemo } from "react";

import { stablecoinContract } from "~/consts/contracts";
import { fromAssetSlug, toTokenSlug } from "~/lib/assets";
import {
  createFallbackTokenMetadata,
  STABLECOIN_METADATA,
  type TokenMetadata,
  useAssetMetadata,
} from "~/lib/metadata";
import { useDexContext } from "~/providers/Dexprovider/dex.provider";
import { DEFAULT_QUOTE_TOKEN_DECIMALS } from "~/providers/Dexprovider/utils";
import { SecondaryEstate } from "~/providers/MarketsProvider/market.types";

const UNKNOWN_TOKEN_SYMBOL = "???";

const createBaseTokenFallbackMetadata = (
  estate: SecondaryEstate
): TokenMetadata =>
  createFallbackTokenMetadata({
    address: estate.token_address,
    decimals: estate.decimals,
    name: estate.name,
    symbol: estate.symbol,
    thumbnailUri: estate.icon || undefined,
  });

const createQuoteTokenFallbackMetadata = (
  quoteTokenSlug: string
): TokenMetadata => {
  const [address, id = "0"] = fromAssetSlug(quoteTokenSlug);
  const isStablecoin = address === stablecoinContract;

  if (isStablecoin) {
    return STABLECOIN_METADATA;
  }

  return createFallbackTokenMetadata({
    address,
    name: "Unknown Token",
    id,
    symbol: UNKNOWN_TOKEN_SYMBOL,
    decimals: DEFAULT_QUOTE_TOKEN_DECIMALS,
  });
};

export const useOrderbookTokenMetadata = (estate: SecondaryEstate) => {
  const { orderbookTokenPair } = useDexContext();
  const { slug } = estate;

  const quoteTokenSlug =
    orderbookTokenPair[slug] ?? toTokenSlug(stablecoinContract);

  const loadedBaseTokenMetadata = useAssetMetadata(slug);
  const loadedQuoteTokenMetadata = useAssetMetadata(quoteTokenSlug);

  const fallbackBaseTokenMetadata = useMemo(
    () => createBaseTokenFallbackMetadata(estate),
    [estate]
  );
  const fallbackQuoteTokenMetadata = useMemo(
    () => createQuoteTokenFallbackMetadata(quoteTokenSlug),
    [quoteTokenSlug]
  );

  const baseTokenMetadata =
    loadedBaseTokenMetadata ?? fallbackBaseTokenMetadata;
  const quoteTokenMetadata =
    loadedQuoteTokenMetadata ?? fallbackQuoteTokenMetadata;

  return {
    baseTokenDecimals: baseTokenMetadata.decimals,
    baseTokenMetadata,
    isMetadataLoaded: Boolean(
      loadedBaseTokenMetadata && loadedQuoteTokenMetadata
    ),
    quoteTokenDecimals: quoteTokenMetadata.decimals,
    quoteTokenMetadata,
    quoteTokenSlug,
  };
};
