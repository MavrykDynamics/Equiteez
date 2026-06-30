import { useMemo } from "react";

import { stablecoinContract } from "~/consts/contracts";
import { fromAssetSlug, toTokenSlug } from "~/lib/assets";
import type { TokenMetadata } from "~/lib/metadata";
import { useAssetMetadata } from "~/lib/metadata";
import { useDexContext } from "~/providers/Dexprovider/dex.provider";
import { SecondaryEstate } from "~/providers/MarketsProvider/market.types";

const DEFAULT_QUOTE_TOKEN_DECIMALS = 6;
const UNKNOWN_TOKEN_SYMBOL = "???";

const createBaseTokenFallbackMetadata = (
  estate: SecondaryEstate
): TokenMetadata => ({
  address: estate.token_address,
  id: "0",
  name: estate.name,
  symbol: estate.symbol,
  decimals: estate.decimals,
  thumbnailUri: estate.icon || undefined,
});

const createQuoteTokenFallbackMetadata = (
  quoteTokenSlug: string
): TokenMetadata => {
  const [address, id = "0"] = fromAssetSlug(quoteTokenSlug);
  const isStablecoin = address === stablecoinContract;

  return {
    address,
    id,
    name: isStablecoin ? "USDT" : "Unknown Token",
    symbol: isStablecoin ? "USDT" : UNKNOWN_TOKEN_SYMBOL,
    decimals: DEFAULT_QUOTE_TOKEN_DECIMALS,
  };
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
