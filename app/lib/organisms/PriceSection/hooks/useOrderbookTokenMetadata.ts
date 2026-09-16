import { toTokenSlug } from "~/lib/assets";
import {
  createFallbackTokenMetadata,
  useAssetMetadata,
  type TokenMetadata,
} from "~/lib/metadata";
import type { AssetType } from "~/lib/apis/rwa/assets/assets.types";
import type { OrderbookExecutionConfig } from "~/lib/orderbook/orderbookConfig.types";

function validateMetadata(
  metadata: TokenMetadata,
  address: string,
  id: string,
  decimals: number
) {
  return (
    metadata.address === address &&
    metadata.id === id &&
    metadata.decimals === decimals &&
    Number.isSafeInteger(decimals) &&
    decimals >= 0
  );
}

export const useOrderbookTokenMetadata = (
  asset: AssetType,
  config: OrderbookExecutionConfig
) => {
  const baseTokenSlug = toTokenSlug(config.baseTokenAddress, config.rwaTokenId);
  const quoteTokenSlug = toTokenSlug(
    config.quoteTokenAddress,
    config.quoteTokenId
  );
  const loadedBase = useAssetMetadata(baseTokenSlug);
  const loadedQuote = useAssetMetadata(quoteTokenSlug);
  const baseTokenMetadata =
    loadedBase ??
    createFallbackTokenMetadata({
      address: config.baseTokenAddress,
      id: config.rwaTokenId,
      decimals: asset.metadata.decimals,
      name: asset.metadata.name,
      symbol: asset.metadata.symbol,
      thumbnailUri: asset.metadata.icon,
    });
  const quoteTokenMetadata =
    loadedQuote ??
    createFallbackTokenMetadata({
      address: config.quoteTokenAddress,
      id: config.quoteTokenId,
      decimals: asset.orderbook!.quote_token.decimals,
      name: asset.orderbook!.quote_token.symbol,
      symbol: asset.orderbook!.quote_token.symbol,
    });
  const isMetadataLoaded =
    validateMetadata(
      baseTokenMetadata,
      config.baseTokenAddress,
      config.rwaTokenId,
      asset.metadata.decimals
    ) &&
    validateMetadata(
      quoteTokenMetadata,
      config.quoteTokenAddress,
      config.quoteTokenId,
      asset.orderbook!.quote_token.decimals
    );
  return {
    baseTokenSlug,
    baseTokenMetadata,
    quoteTokenMetadata,
    quoteTokenSlug,
    baseTokenDecimals: baseTokenMetadata.decimals,
    quoteTokenDecimals: quoteTokenMetadata.decimals,
    isMetadataLoaded,
  };
};

export type OrderbookTokenMetadata = ReturnType<
  typeof useOrderbookTokenMetadata
>;
